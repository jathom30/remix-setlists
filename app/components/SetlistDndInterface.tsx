import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { createPortal, unstable_batchedUpdates } from 'react-dom';
import { ClientOnly } from 'remix-utils'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { SerializeFrom } from "@remix-run/node";
import { DragInTheMiddle, FlexList, SongDisplay } from "~/components";
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier, CollisionDetection, DraggableAttributes } from "@dnd-kit/core";
import { closestCenter, pointerWithin, rectIntersection, getFirstCollision, MouseSensor, TouchSensor, DndContext, KeyboardSensor, useSensor, useSensors, DragOverlay, MeasuringStrategy } from "@dnd-kit/core";
import type { AnimateLayoutChanges } from "@dnd-kit/sortable";
import { arrayMove, defaultAnimateLayoutChanges, SortableContext, useSortable } from "@dnd-kit/sortable";
import { coordinateGetter } from "~/utils/dnd";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { Song } from "@prisma/client";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const PLACEHOLDER_ID = 'placeholder'
const UNUSED_SONG_IDS = 'unused'
const SEPARATOR = 'separator'

export const SetlistDndInterface = ({ songs, initialSetsState, setlistTitle }: { songs: SerializeFrom<Song>[]; initialSetsState?: Record<string, UniqueIdentifier[]>; setlistTitle?: string }) => {
  const allSongIds = songs.map(song => song.id)
  const [y, setY] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // get container height
  useEffect(() => {
    if (!containerRef.current) { return }

    const getHeight = () => {
      const containerHeight = containerRef.current?.clientHeight || 0
      setContainerHeight(containerHeight)
    }
    getHeight()
    window.addEventListener('resize', getHeight)
    return () => window.removeEventListener('resize', getHeight)
  }, [])

  // when setting initial state, filter used from unused songs
  const songIdsInInitialSetsState = Object.values(initialSetsState || {}).flat()
  const defaultSetState = {
    [UNUSED_SONG_IDS]: allSongIds.filter(songId => !songIdsInInitialSetsState.includes(songId)),
    ...initialSetsState
  }
  const [songIdsBySet, setSongIdsBySet] = useState<Record<string, UniqueIdentifier[]>>(defaultSetState)
  // sets are derived from the above songIdsBySet' keys
  const [setIds, setSetIds] = useState(Object.keys(songIdsBySet) as UniqueIdentifier[])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const getSongById = (songId: UniqueIdentifier) => {
    return songs.find(song => song.id === songId)
  }

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in songIdsBySet) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in songIdsBySet
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
          pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        if (overId in songIdsBySet) {
          const containerItems = songIdsBySet[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, songIdsBySet]
  );

  const [clonedItems, setClonedItems] = useState<Record<string, UniqueIdentifier[]> | null>(null);


  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );
  const findContainer = (id: UniqueIdentifier) => {
    if (id in songIdsBySet) {
      return id;
    }

    return Object.keys(songIdsBySet).find((key) => songIdsBySet[key].includes(id));
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setSongIdsBySet(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };
  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [songIdsBySet]);

  const getSetLengthInMinutes = (setId: UniqueIdentifier) => {
    const songs = songIdsBySet[setId]
    return songs.reduce((sum: number, songId) => sum += (getSongById(songId)?.length || 0), 0)
  }

  const splitRatio = 2 / 3

  return (
    <div className="@container overflow-hidden flex-1" ref={containerRef}>
      <DndContext
        id="setlist"
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={({ active }) => {
          setActiveId(active.id)
          setClonedItems(songIdsBySet)
        }}
        onDragOver={({ active, over }) => {
          const overId = over?.id;

          if (overId == null || active.id in songIdsBySet) {
            return;
          }

          const overContainer = findContainer(overId);
          const activeContainer = findContainer(active.id);

          if (!overContainer || !activeContainer) {
            return;
          }

          if (activeContainer !== overContainer) {
            setSongIdsBySet((items) => {
              const activeItems = items[activeContainer];
              const overItems = items[overContainer];
              const overIndex = overItems.indexOf(overId);
              const activeIndex = activeItems.indexOf(active.id);

              let newIndex: number;

              if (overId in items) {
                newIndex = overItems.length + 1;
              } else {
                const isBelowOverItem =
                  over &&
                  active.rect.current.translated &&
                  active.rect.current.translated.top >
                  over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;

                newIndex =
                  overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
              }

              recentlyMovedToNewContainer.current = true;

              return {
                ...items,
                [activeContainer]: items[activeContainer].filter(
                  (item) => item !== active.id
                ),
                [overContainer]: [
                  ...items[overContainer].slice(0, newIndex),
                  items[activeContainer][activeIndex],
                  ...items[overContainer].slice(
                    newIndex,
                    items[overContainer].length
                  ),
                ],
              };
            });
          }
        }}
        onDragEnd={({ active, over, delta }) => {
          // * if moving MOBILE separator
          if (active.id === SEPARATOR) {
            const minHeight = 120
            const initialHeight = containerHeight * splitRatio
            const maxHeight = containerHeight - minHeight
            setY(prevY => {
              const nextY = prevY - delta.y
              const nextHeight = initialHeight - nextY
              if (nextHeight < minHeight) {
                return initialHeight - minHeight
              }
              if (nextHeight > maxHeight) {
                return (maxHeight - initialHeight) * -1
              }
              return nextY
            })
          }

          // if moving whole sets
          if (active.id in songIdsBySet && over?.id) {
            setSetIds((containers) => {
              const activeIndex = containers.indexOf(active.id);
              const overIndex = containers.indexOf(over.id);

              return arrayMove(containers, activeIndex, overIndex);
            });
          }

          const activeContainer = findContainer(active.id);

          if (!activeContainer) {
            setActiveId(null);
            return;
          }

          const overId = over?.id;

          if (overId == null) {
            setActiveId(null);
            return;
          }

          function getNextContainerId() {
            const containerIds = Object.keys(songIdsBySet);
            const lastContainerId = containerIds[containerIds.length - 1];

            return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
          }

          if (overId === PLACEHOLDER_ID) {
            const newContainerId = getNextContainerId();

            unstable_batchedUpdates(() => {
              // when creating a new set
              setSetIds((containers) => [...containers, newContainerId]);
              setSongIdsBySet((items) => ({
                ...items,
                [activeContainer]: items[activeContainer].filter(
                  (id) => id !== activeId
                ),
                [newContainerId]: [active.id],
              }));
              setActiveId(null);
            });
            return;
          }

          const overContainer = findContainer(overId);

          if (overContainer) {
            const activeIndex = songIdsBySet[activeContainer].indexOf(active.id);
            const overIndex = songIdsBySet[overContainer].indexOf(overId);
            // if (activeIndex !== overIndex) {
            setSongIdsBySet((items) => {
              const newSets = {
                ...items,
                [overContainer]: arrayMove(
                  items[overContainer],
                  activeIndex,
                  overIndex
                ),
              }
              // remove empty sets
              const cleanedSets = Object.entries(newSets).reduce((sets: Record<string, UniqueIdentifier[]>, [setId, songIds]) => {
                // remove sets with no songs unless it is the "unused" song pool
                if (!songIds.length && setId !== UNUSED_SONG_IDS) {
                  return sets
                }
                return { ...sets, [setId]: songIds }
              }, {})
              // need to update setIds if cleaning removed one
              if (Object.keys(cleanedSets).length !== Object.keys(newSets).length) {
                setSetIds(Object.keys(cleanedSets))
              }
              return newSets
            });
            // }
          }
          setActiveId(null);
        }}
        onDragCancel={onDragCancel}
      >
        <SortableContext
          items={[...setIds, PLACEHOLDER_ID]}
        >
          {/* desktop, drag and drop */}
          <div className="h-full hidden sm:flex">
            <aside className="p-2 flex flex-col w-52 @3xl:w-80">
              <h1 className="pb-2 font-bold text-lg">Available Songs</h1>
              <DroppableUnusedSongsList id={UNUSED_SONG_IDS} songIds={songIdsBySet[UNUSED_SONG_IDS]}>
                <FlexList direction="col" gap={2}>
                  <SortableContext items={songIdsBySet[UNUSED_SONG_IDS]}>
                    {songIdsBySet[UNUSED_SONG_IDS].map(songId => (
                      <DraggableSong key={songId} song={getSongById(songId)} />
                    ))}
                  </SortableContext>
                </FlexList>
              </DroppableUnusedSongsList>
            </aside>
            <main className="p-2 w-full h-full flex flex-col overflow-hidden">
              <h1 className="pb-2 font-bold text-lg">{setlistTitle || 'New Setlist'}</h1>
              <div className="flex flex-col overflow-auto gap-2">
                {setIds.filter(setId => setId !== UNUSED_SONG_IDS).map((setId, index) => (
                  <DroppableSet key={setId} id={setId} index={index} songIds={songIdsBySet[setId]} minuteLength={getSetLengthInMinutes(setId)}>
                    <FlexList>
                      <SortableContext items={songIdsBySet[setId]}>
                        {songIdsBySet[setId].map(songId => (
                          <DraggableSong key={songId} song={getSongById(songId)} />
                        ))}
                      </SortableContext>
                    </FlexList>
                  </DroppableSet>
                ))}
                <DroppableSet id={PLACEHOLDER_ID} index={-1} songIds={[]} minuteLength={-1} />
              </div>
            </main>
          </div>

          {/* mobile drag and drop */}
          <div className="h-full sm:hidden">
            <DragInTheMiddle
              id={SEPARATOR}
              y={y}
              containerHeight={containerHeight}
              splitRatio={2 / 3}
              topContent={
                <main className="p-2 w-full h-full flex flex-col overflow-hidden">
                  <h1 className="pb-2 font-bold text-lg">{setlistTitle || 'New Setlist'}</h1>
                  <div className="flex flex-col overflow-auto gap-2">
                    {setIds.filter(setId => setId !== UNUSED_SONG_IDS).map((setId, index) => (
                      <DroppableSet key={setId} id={setId} index={index} songIds={songIdsBySet[setId]} minuteLength={getSetLengthInMinutes(setId)}>
                        <SortableContext items={songIdsBySet[setId]}>
                          {songIdsBySet[setId].map(songId => (
                            <DraggableSong key={songId} song={getSongById(songId)} />
                          ))}
                        </SortableContext>
                      </DroppableSet>
                    ))}
                    <DroppableSet id={PLACEHOLDER_ID} index={-1} songIds={[]} minuteLength={-1} />
                  </div>
                </main>
              }
              bottomContent={
                <aside className="p-2 flex flex-col overflow-hidden">
                  <h1 className="pb-2 font-bold text-lg">Available Songs</h1>
                  <DroppableUnusedSongsList id={UNUSED_SONG_IDS} songIds={songIdsBySet[UNUSED_SONG_IDS]}>
                    <FlexList direction="col" gap={2}>
                      <SortableContext items={songIdsBySet[UNUSED_SONG_IDS]}>
                        {songIdsBySet[UNUSED_SONG_IDS].map(songId => (
                          <DraggableSong key={songId} song={getSongById(songId)} />
                        ))}
                      </SortableContext>
                    </FlexList>
                  </DroppableUnusedSongsList>
                </aside>}
            />
          </div>

        </SortableContext>
        <ClientOnly fallback={<span>Loading...</span>}>
          {() => createPortal(
            <DragOverlay>
              {activeId
                ? setIds.includes(activeId)
                  ? <SetDragOverlay />
                  : <DraggableSong song={getSongById(activeId)} />
                : null
              }
            </DragOverlay>,
            document.body
          )}
        </ClientOnly>
      </DndContext>
    </div>
  )
}

const SetDragOverlay = () => {
  return (
    <div className={`bg-base-200 p-4 rounded`}>
      <FlexList direction="row" items="center">
        <div className="btn cursor-grab" data-cypress="draggable-handle">
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        <h2 className="font-bold">Reording set...</h2>
      </FlexList>
    </div>
  )
}

const DragHandle = ({ children, listeners, attributes }: { children: ReactNode; listeners?: SyntheticListenerMap; attributes: DraggableAttributes }) => {
  return (
    <button className="btn btn-sm btn-ghost cursor-grab" data-cypress="draggable-handle" {...listeners} {...attributes}>
      {children}
    </button>
  )
}

const DroppableUnusedSongsList = ({ children, id, songIds }: { children: ReactNode; id: UniqueIdentifier; songIds: UniqueIdentifier[] }) => {
  const {
    active,
    over,
    setNodeRef,
    isDragging,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: songIds
    },
    animateLayoutChanges
  })

  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
    songIds.includes(over.id)
    : false;
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col overflow-auto gap-2 h-full ${isOverContainer ? 'bg-base-300' : ''}`}
      style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
    >
      {children}
    </div>
  )
}

const DroppableSet = ({ children, id, index, songIds, minuteLength }: { children?: ReactNode; id: UniqueIdentifier, index: number; songIds: UniqueIdentifier[]; minuteLength: number }) => {
  const {
    active,
    attributes,
    listeners,
    over,
    setNodeRef,
    isDragging,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: songIds
    },
    animateLayoutChanges
  })
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
    songIds.includes(over.id)
    : false;

  // If no children, we can render an "empty" drop zone
  if (!children) {
    return (
      <div
        ref={setNodeRef}
        className={`bg-base-200 p-4 rounded text-center border ${isOverContainer ? '' : 'border-dashed'}`}
        aria-label="Droppable region"
        style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
      >
        <span className="uppercase text-sm">Drag song here to create a new set</span>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={`bg-base-200 p-4 rounded ${isOverContainer ? 'border' : ''}`}
      style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
    >
      <div className="pb-2">
        <FlexList direction="row" items="center">
          <DragHandle listeners={listeners} attributes={attributes}>
            <FontAwesomeIcon icon={faGripVertical} />
          </DragHandle>
          <h2 className="font-bold">Set {index + 1} - {minuteLength} min</h2>
        </FlexList>
      </div>
      <FlexList gap={2}>
        {children}
      </FlexList>
      <input hidden type="hidden" name={index.toString()} value={songIds as string[]} />
    </div>
  )
}

const DraggableSong = ({ song }: { song?: SerializeFrom<Song> }) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: song?.id || '' });

  if (!song) { return null }
  return (
    <div
      ref={setNodeRef}
      className="bg-base-100 p-2 rounded"
      style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
    >
      <FlexList direction="row" items="center" width="full" gap={2}>
        <DragHandle attributes={attributes} listeners={listeners}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragHandle>
        <SongDisplay song={song} width="half" />
      </FlexList>
    </div>
  )
}