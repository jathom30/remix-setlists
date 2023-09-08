import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json, SerializeFrom, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button, FlexHeader, FlexList, SongDisplay, TempoIcons, TextOverflow } from "~/components";
import { getSongs } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier, DragEndEvent, DragOverEvent, DragStartEvent, CollisionDetection, DraggableAttributes } from "@dnd-kit/core";
import { MeasuringStrategy } from "@dnd-kit/core";
import { closestCenter, pointerWithin, rectIntersection, getFirstCollision, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { AnimateLayoutChanges, arrayMove, defaultAnimateLayoutChanges, horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { coordinateGetter } from "~/utils/dnd";
import { ReactNode, useCallback, useRef, useState } from "react";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { Song } from "@prisma/client";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId)
  await requireNonSubMember(request, bandId)

  const songs = await getSongs(bandId)
  return json({ songs })
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const PLACEHOLDER_ID = 'placeholder'
const UNUSED_SONG_IDS = 'unused'

export default function Fresh() {
  const { songs } = useLoaderData<typeof loader>()
  const tempInitialData = {
    [UNUSED_SONG_IDS]: songs.map(song => song.id),
  }
  const [songSets, setSongSets] = useState<Record<string, string[]>>(tempInitialData)
  // sets are derived from the above songSets' keys
  const [sets, setSets] = useState(Object.keys(songSets) as UniqueIdentifier[])
  const getSongById = (songId: UniqueIdentifier) => {
    return songs.find(song => song.id === songId)
  }

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? sets.includes(activeId) : false;

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  // const collisionDetectionStrategy: CollisionDetection = useCallback(
  //   (args) => {
  //     if (activeId && activeId in songSets) {
  //       return closestCenter({
  //         ...args,
  //         droppableContainers: args.droppableContainers.filter(
  //           (container) => container.id in songSets
  //         ),
  //       });
  //     }

  //     // Start by finding any intersecting droppable
  //     const pointerIntersections = pointerWithin(args);
  //     const intersections =
  //       pointerIntersections.length > 0
  //         ? // If there are droppables intersecting with the pointer, return those
  //           pointerIntersections
  //         : rectIntersection(args);
  //     let overId = getFirstCollision(intersections, 'id');

  //     if (overId != null) {
  //       // if (overId === TRASH_ID) {
  //       //   // If the intersecting droppable is the trash, return early
  //       //   // Remove this if you're not using trashable functionality in your app
  //       //   return intersections;
  //       // }

  //       if (overId in songSets) {
  //         const containerItems = songSets[overId];

  //         // If a container is matched and it contains items (columns 'A', 'B', 'C')
  //         if (containerItems.length > 0) {
  //           // Return the closest droppable within that container
  //           overId = closestCenter({
  //             ...args,
  //             droppableContainers: args.droppableContainers.filter(
  //               (container) =>
  //                 container.id !== overId &&
  //                 containerItems.includes(container.id)
  //             ),
  //           })[0]?.id;
  //         }
  //       }

  //       lastOverId.current = overId;

  //       return [{id: overId}];
  //     }

  //     // When a draggable item moves to a new container, the layout may shift
  //     // and the `overId` may become `null`. We manually set the cached `lastOverId`
  //     // to the id of the draggable item that was moved to the new container, otherwise
  //     // the previous `overId` will be returned which can cause items to incorrectly shift positions
  //     if (recentlyMovedToNewContainer.current) {
  //       lastOverId.current = activeId;
  //     }

  //     // If no droppable is matched, return the last match
  //     return lastOverId.current ? [{id: lastOverId.current}] : [];
  //   },
  //   [activeId, songSets]
  // );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );
  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        }
      }}
    >
      <FlexList direction="row" gap={0} height="full">
        <SortableContext
          items={[...sets, PLACEHOLDER_ID]}
          strategy={horizontalListSortingStrategy}
        >
          <aside className="p-2 flex flex-col border-r h-full w-80">
            <h1 className="pb-2 font-bold text-lg">Available Songs</h1>
            <DroppableUnusedSongsList
              id={UNUSED_SONG_IDS}
              songIds={songSets.unused}
            >
              <div className="flex flex-col gap-2 h-full overflow-auto">
                {songs.map(song => (
                  <SortableAvailableSong key={song.id} song={song} />
                ))}
              </div>
            </DroppableUnusedSongsList>
          </aside>

          <main className="flex-grow p-2 h-full">
            <h1 className="pb-2 font-bold text-lg">New Setlist</h1>
            <div className="h-full overflow-auto">
              <FlexList>
                {/* map over containers/sets */}
                {/* do not map over the "unused" set key, those should stay with the DroppableUnusedSongsList */}
                {sets.filter(set => set !== UNUSED_SONG_IDS).map((set, setIndex) => (
                  <DroppableSet key={set} id={set} index={setIndex} songIds={songSets[set]}>
                    <SortableContext items={songSets[set]} strategy={verticalListSortingStrategy}>
                      {songSets[set].map(songId => (
                        <SortableSong key={songId} song={getSongById(songId)} />
                      ))}
                    </SortableContext>
                  </DroppableSet>
                ))}
                <div className="bg-base-200 p-4 rounded text-center border border-dashed">
                  <span className="uppercase text-sm">Drag song here to create a new set</span>
                </div>
              </FlexList>
            </div>
          </main>
        </SortableContext>
      </FlexList>
    </DndContext>
  )
}

const DroppableUnusedSongsList = ({ children, id, songIds }: { children: ReactNode; id: UniqueIdentifier; songIds: UniqueIdentifier[] }) => {
  const {
    active,
    // attributes,
    // listeners,
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
      className={`flex flex-col gap-2 ${isOverContainer ? 'bg-base-300' : ''}`}
      style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
    >
      {children}
    </div>
  )
}

const DroppableSet = ({ children, id, index, songIds }: { children: ReactNode; id: UniqueIdentifier, index: number; songIds: UniqueIdentifier[] }) => {
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

  return (
    <div
      ref={setNodeRef}
      className={`bg-base-200 p-4 rounded ${isOverContainer ? 'bg-base-300' : ''}`}
      style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
    >
      <div className="pb-2">
        <FlexList direction="row" items="center">
          <DragHandle listeners={listeners} attributes={attributes}>
            <FontAwesomeIcon icon={faGripVertical} />
          </DragHandle>
          <h2 className="font-bold">Set {index + 1} - 15 min</h2>
        </FlexList>
      </div>
      <FlexList gap={2}>
        {children}
      </FlexList>
    </div>
  )
}

const SortableAvailableSong = ({ song }: { song?: SerializeFrom<Song> }) => {
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
      className="p-2 pl-4 bg-base-100 rounded flex items-center gap-4"
      style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
    >
      <DragHandle attributes={attributes} listeners={listeners}>
        <FontAwesomeIcon icon={faGripVertical} />
      </DragHandle>
      <div className="flex flex-col w-full overflow-hidden">
        <TextOverflow className="font-bold">{song.name}</TextOverflow>
        <FlexHeader>
          <TextOverflow className="text-xs">{song.author || '--'}</TextOverflow>
          <TempoIcons tempo={song.tempo} />
        </FlexHeader>
      </div>
    </div>
  )
}

const SortableSong = ({ song }: { song?: SerializeFrom<Song> }) => {
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
      className="bg-base-100 p-2 px-4 rounded"
      style={{ transition, transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : undefined }}
    >
      <FlexList direction="row" items="center">
        <DragHandle attributes={attributes} listeners={listeners}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragHandle>
        <SongDisplay song={song} />
      </FlexList>
    </div>
  )
}

const DragHandle = ({ children, listeners, attributes }: { children: ReactNode; listeners?: SyntheticListenerMap; attributes: DraggableAttributes }) => {
  return (
    <button className="btn cursor-grab" data-cypress="draggable-handle" {...listeners} {...attributes}>
      {children}
    </button>
  )
}