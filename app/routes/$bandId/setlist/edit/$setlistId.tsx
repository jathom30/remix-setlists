import { faGripVertical, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from '@remix-run/node'
import type { ShouldReloadFunction } from "@remix-run/react";
import { Outlet, useFetcher, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Breadcrumbs, CatchContainer, DroppableContainer, ErrorContainer, FlexHeader, FlexList, Link, MaxHeightContainer, MaxWidth, MobileModal, Navbar, SaveButtons, SongDisplay, Title } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { CSS } from "@dnd-kit/utilities";
import type { Song } from "@prisma/client";
import { UniqueIdentifier, DragEndEvent, DragOverEvent, DragStartEvent, CollisionDetection, MeasuringStrategy } from "@dnd-kit/core";
import { closestCenter, pointerWithin, rectIntersection, getFirstCollision, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, useSensor, useSensors, DragOverlay, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { useSpinDelay } from 'spin-delay';
import { useState } from "react";
import { moveBetweenContainers } from "~/utils/sets";
import { updateSet } from "~/models/set.server";
import { coordinateGetter } from "~/utils/dnd";
import { unstable_batchedUpdates } from "react-dom";

type SetSong = SerializeFrom<{
  songId: string;
  positionInSet: number;
  setId: string;
  song: Song | null;
}>

export async function loader({ request, params }: LoaderArgs) {
  const { setlistId, bandId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)

  const setlist = await getSetlist(setlistId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const formData = await request.formData()

  const entries = Object.fromEntries(formData.entries())

  Object.keys(entries).forEach(async (key, i) => {
    const songIds = entries[key].toString().split(',')
    // TODO pass in positionIsSetlist instead of using index from forEach
    await updateSet(key, songIds, i)
  })

  return null
}

const subRoutes = ['addSongs', 'newSong', 'removeSong', 'createSet', 'createSong', 'saveChanges', 'confirmCancel']

// this feels like some hacky shit
export const unstable_shouldReload: ShouldReloadFunction = ({ prevUrl }) => {
  const shouldReload = subRoutes.some(route => prevUrl.pathname.includes(route))
  if (shouldReload) {
    document.location.reload()
  }
  return true
}

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;
export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';


export default function EditSetlist() {
  const fetcher = useFetcher()
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [isOpenSets, setIsOpenSets] = useState(true)

  const keySets = setlist.sets.reduce((acc, set) => {
    return {
      ...acc,
      [set.id]: set.songs.map(song => song.songId),
    }
  }, {} as Items)


  const isLoading = useSpinDelay(fetcher.state !== 'idle')

  const [items, setItems] = useState(keySets)
  const [containers, setContainers] = useState(Object.keys(items) as UniqueIdentifier[])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

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
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
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
        if (overId === TRASH_ID) {
          // If the intersecting droppable is the trash, return early
          // Remove this if you're not using trashable functionality in your app
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId];

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
    [activeId, items]
  );

  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);
    setClonedItems(items);
  }

  // function handleDragOver({ active, over }: DragOverEvent) {
  //   const overId = over?.id;

  //   if (!overId) {
  //     return;
  //   }

  //   const activeContainer = active.data.current?.sortable.containerId;
  //   const overContainer = over.data.current?.sortable.containerId;

  //   if (!overContainer) {
  //     return;
  //   }

  //   // figure out if a set or song is dragging
  //   if (activeContainer !== overContainer) {
  //     setItems((items) => {
  //       const activeIndex = active.data.current?.sortable.index;
  //       const overIndex = over.data.current?.sortable.index || 0;
  //       const draggedSong = getSong(active.id)

  //       if (!draggedSong) return items
  //       return moveBetweenContainers(
  //         { ...items },
  //         activeContainer,
  //         activeIndex,
  //         overContainer,
  //         overIndex,
  //         draggedSong
  //       );
  //     });
  //   }
  // }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    if (overId == null || overId === TRASH_ID || active.id in items) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
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
  }

  // const handleDragEnd = ({ active, over }: DragEndEvent) => {
  //   if (!over) {
  //     return;
  //   }

  //   if (active.id !== over.id) {
  //     const activeContainer = active.data.current?.sortable.containerId;
  //     const overContainer = over.data.current?.sortable.containerId || over.id;
  //     const activeIndex = active.data.current?.sortable.index;
  //     const overIndex = over.data.current?.sortable.index || 0;

  //     setItems((prevSets) => {
  //       let newItems: Record<string, SetSong[]>;
  //       if (activeContainer === overContainer) {
  //         newItems = {
  //           ...prevSets,
  //           [overContainer]: arrayMove(
  //             prevSets[overContainer],
  //             activeIndex,
  //             overIndex
  //           )
  //         };
  //       } else {
  //         const draggedSong = getSong(active.id)

  //         if (!draggedSong) return prevSets
  //         newItems = moveBetweenContainers(
  //           prevSets,
  //           activeContainer,
  //           activeIndex,
  //           overContainer,
  //           overIndex,
  //           draggedSong
  //         );
  //       }

  //       const setsSongIds = Object.keys(newItems).reduce((acc, setId) => {
  //         return {
  //           ...acc,
  //           [setId]: newItems[setId].map(song => song.songId)
  //         }
  //       }, {})
  //       fetcher.submit(setsSongIds, { method: 'put' })
  //       return newItems;
  //     });
  //   }
  //   setActiveId(null)
  // };

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id in items && over?.id) {
      setContainers((containers) => {
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

    if (overId === TRASH_ID) {
      setItems((items) => ({
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (id) => id !== activeId
        ),
      }));
      setActiveId(null);
      return;
    }

    if (overId === PLACEHOLDER_ID) {
      const newContainerId = getNextContainerId();

      unstable_batchedUpdates(() => {
        setContainers((containers) => [...containers, newContainerId]);
        setItems((items) => ({
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
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
  }

  const getSong = (id: UniqueIdentifier) => {
    const allSongs = setlist.sets.map(set => set.songs).flat()
    return allSongs.find(song => song.songId === id)
  }

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <div>
              <Title>Editing {setlist.name}</Title>
              <Breadcrumbs breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: setlist.name, to: `/${bandId}/setlist/${setlist.id}` },
                { label: 'Edit', to: '.' },
              ]} />
            </div>
          </FlexHeader>
        </Navbar>
      }
      footer={
        <>
          <MaxWidth>
            <FlexList pad={4}>
              <Link to="saveChanges" kind="primary" isSaving={isLoading} icon={faSave}>Save</Link>
            </FlexList>
          </MaxWidth>
          <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <MaxWidth>
        <DndContext
          id={setlist.id}
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          modifiers={[restrictToFirstScrollableAncestor]}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext id={setlist.id} items={[...containers, PLACEHOLDER_ID]} strategy={verticalListSortingStrategy}>
            {containers.map(containerId => (
              <DroppableContainer
                key={containerId}
                id={containerId}
                items={items[containerId]}
              // onRemove={() => handleRemove(containerId)}
              >
                <SortableContext items={items[containerId]} strategy={verticalListSortingStrategy}>
                  {items[containerId].map(itemId => (
                    <SortableSong
                      key={itemId}
                      id={itemId}
                      song={getSong(itemId)}
                    />
                  ))}
                </SortableContext>
              </DroppableContainer>
            ))}
          </SortableContext>
          {/* TODO Setoverlay */}
          {activeId ? <SongOverlay song={getSong(activeId || '')} /> : null}
        </DndContext>
        <FlexList pad={4}>
          <Link to="createSet">Create new set</Link>
        </FlexList>
      </MaxWidth>
    </MaxHeightContainer>
  )
}

const SongOverlay = ({ song }: { song?: SetSong }) => {
  if (!song) { return null }
  return (
    <DragOverlay>
      <DraggedSong song={song} />
    </DragOverlay>
  )
}

// const DroppableArea = ({ id, children }: { id: string; children: ReactNode }) => {
//   const { setNodeRef } = useDroppable({ id })

//   return (
//     <div ref={setNodeRef}>{children}</div>
//   )
// }


const SortableSong = ({ id, song }: { id: UniqueIdentifier; song?: SetSong }) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "default",
  };

  if (!song) { return null }

  return (
    <div style={itemStyle} ref={setNodeRef} {...attributes}>
      <DraggedSong isDragging={isDragging} song={song} listeners={listeners} />
    </div>
  )
}

const DraggedSong = ({ isDragging = false, song, listeners }: { isDragging?: boolean; song: SetSong; listeners?: any }) => {
  return (
    <div className={`relative overflow-hidden rounded bg-base-100 ${isDragging ? 'bg-base-300' : ''}`}>
      <FlexList pad={2} direction="row" items="center">
        <div className={`btn btn-circle btn-sm cursor-grab`} {...listeners} tabIndex={-1}>
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        {song.song ? <SongDisplay song={song.song} /> : null}
        <Link kind="error" size="sm" isRounded to={`${song.setId}/removeSong/${song.songId}`}>
          <FontAwesomeIcon icon={faTrash} />
        </Link>
      </FlexList>
      {isDragging ? <div className="absolute inset-0 bg-base-300" /> : null}
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}
export function CatchBoundary() {
  return <CatchContainer />
}


{/* <DroppableArea id={setlist.id}>
              <FlexList pad={4}>
                {Object.keys(items).map((setId, i) => (
                  <Collapsible
                    key={setId}
                    isOpen={isOpenSets}
                    header={
                      <div className="pb-4">
                        <FlexHeader>
                          <SortableSet id={setId}>
                            <FlexHeader>
                              <Label>Set {i + 1} - [GET SETLENGTH] minutes</Label>
                              <Link to={`${setId}/addSongs`} icon={faPlus} isOutline isCollapsing>Add songs</Link>
                            </FlexHeader>
                          </SortableSet>
                        </FlexHeader>
                      </div>
                    }
                  >
                    <SortableContext id={setId} items={items[setId]} strategy={verticalListSortingStrategy}>
                      <DroppableArea id={setId}>
                        <FlexList gap={2}>
                          {items[setId].map(id => {
                            const song = getSong(id)
                            if (!song) return null
                            return <SortableSong id={id} key={id} song={song} />
                          })}
                        </FlexList>
                      </DroppableArea>
                    </SortableContext>
                  </Collapsible>
                ))}
              </FlexList>
            </DroppableArea> */}