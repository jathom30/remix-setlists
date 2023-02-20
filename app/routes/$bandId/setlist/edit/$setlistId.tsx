import { faGripVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from '@remix-run/node'
import { Outlet, useFetcher, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { AvatarTitle, Breadcrumbs, CatchContainer, DroppableContainer, ErrorContainer, FlexHeader, FlexList, Link, MaxHeightContainer, MaxWidth, MobileMenu, MobileModal, Navbar, SaveButtons, SongDisplay } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { CSS } from "@dnd-kit/utilities";
import type { Song } from "@prisma/client";
import type { UniqueIdentifier, DragEndEvent, DragOverEvent, DragStartEvent, CollisionDetection } from "@dnd-kit/core";
import { MeasuringStrategy } from "@dnd-kit/core";
import { closestCenter, pointerWithin, rectIntersection, getFirstCollision, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import { updateSetPosition, updateSetSongs } from "~/models/set.server";
import { coordinateGetter } from "~/utils/dnd";
import { getSetLength } from "~/utils/setlists";

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

  const intent = formData.get('intent')?.toString()

  if (intent === 'songs') {
    const entries = Object.fromEntries(formData.entries())
    // remove intent from entries before hitting DB
    const setIds = Object.keys(entries).filter(entryKey => entryKey !== 'intent')
    const updatedSets = await Promise.all(setIds.map(async (key) => {
      const songIds = entries[key].toString().split(',')
      return await updateSetSongs(key, songIds)
    }))
    return updatedSets
  }

  if (intent === 'sets') {
    const sets = formData.get('sets')?.toString().split(',')
    if (!sets) return null
    const updatedSets = await Promise.all(sets.map(async (setId, i) => {
      return await updateSetPosition(setId, i)
    }))
    return updatedSets
  }

  return null
}

const subRoutes = ['addSongs', 'newSong', 'removeSong', 'createSet', 'createSong', 'saveChanges', 'confirmCancel']

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

  const getLengthOfSet = (setId: UniqueIdentifier) => {
    const set = setlist.sets.find(set => set.id === setId)
    if (!set) return
    return getSetLength(set.songs)
  }

  const [items, setItems] = useState(keySets)
  const [containers, setContainers] = useState(Object.keys(keySets) as UniqueIdentifier[])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId && containers.includes(activeId);
  const isSongContainer = activeId && !containers.includes(activeId);

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

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id in items && over?.id) {
      setContainers((containers) => {
        const activeIndex = containers.indexOf(active.id);
        const overIndex = containers.indexOf(over.id);

        const newContainers = arrayMove(containers, activeIndex, overIndex);

        const formData = { sets: newContainers.join(','), intent: 'sets' }
        fetcher.submit(formData, { method: 'put', replace: true })
        return newContainers
      });
      return
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

    const overContainer = findContainer(overId);

    if (overContainer) {
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItems((items) => {
          const newItems = {
            ...items,
            [overContainer]: arrayMove(
              items[overContainer],
              activeIndex,
              overIndex
            ),
          }
          const formData = { ...newItems, intent: 'songs' }
          fetcher.submit(formData, { method: 'put', replace: true })
          return newItems
        });
      } else {
        const formData = { ...items, intent: 'songs' }
        fetcher.submit(formData, { method: 'put', replace: true })
      }
    }

    setIsOpenSets(true)
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
        <>
          <Navbar>
            <FlexHeader>
              <AvatarTitle title={`Editing ${setlist.name}`} />
              <MobileMenu />
            </FlexHeader>
          </Navbar>
          <Navbar shrink>
            <Breadcrumbs breadcrumbs={[
              { label: 'Setlists', to: `/${bandId}/setlists` },
              { label: setlist.name, to: `/${bandId}/setlist/${setlist.id}` },
              { label: 'Edit', to: '.' },
            ]} />
          </Navbar>
        </>
      }
      footer={
        <>
          <MaxWidth>
            <SaveButtons
              saveLabel="Save"
              saveTo="saveChanges"
              cancelTo="confirmCancel"
            />
          </MaxWidth>
          <MobileModal isPortal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
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
            {containers.map((containerId, i) => (
              <DroppableContainer
                key={containerId}
                id={containerId}
                index={i}
                items={items[containerId]}
                onPointerDown={() => setIsOpenSets(false)}
                onPointerUp={() => setIsOpenSets(true)}
                isOpen={isOpenSets}
                length={getLengthOfSet(containerId) || 0}
              >
                <FlexList gap="sm" pad="md">
                  <SortableContext items={items[containerId]} strategy={verticalListSortingStrategy}>
                    {items[containerId]?.map(itemId => (
                      <SortableSong
                        key={itemId}
                        id={itemId}
                        song={getSong(itemId)}
                      />
                    ))}
                    {items[containerId].length === 0 ? (
                      <div className="bg-base-300 rounded">
                        <FlexList pad="md" direction="row" items="center" justify="center">
                          <span>This empty set will be deleted upon save</span>
                        </FlexList>
                      </div>
                    ) : null}
                  </SortableContext>
                </FlexList>
              </DroppableContainer>
            ))}
          </SortableContext>
          <DragOverlay>
            {isSortingContainer ? (
              <SetOverlay
                length={getLengthOfSet(activeId) || 0}
                index={containers.indexOf(activeId)}
                id={activeId}
                items={[]}
                onPointerDown={() => setIsOpenSets(false)}
                onPointerUp={() => setIsOpenSets(true)}
              />
            ) : null}
            {isSongContainer ? (
              <SongOverlay song={getSong(activeId || '')} />
            ) : null}
          </DragOverlay>
        </DndContext>
        <FlexList pad="md">
          <Link to={`createSet?position=${containers.length}`}>Create new set</Link>
        </FlexList>
      </MaxWidth>
    </MaxHeightContainer>
  )
}

const SongOverlay = ({ song }: { song?: SetSong }) => {
  if (!song) { return null }
  return (
    <DraggedSong song={song} />
  )
}

const SetOverlay = ({ length, index, id, items, onPointerDown, onPointerUp }: { length: number; index: number; id: UniqueIdentifier; items: UniqueIdentifier[], onPointerDown: () => void, onPointerUp: () => void }) => {
  return (
    <DroppableContainer
      id={id}
      index={index}
      items={items}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      isOpen={false}
      length={length}
    />
  )
}

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
      <FlexList pad="sm" direction="row" items="center">
        <div className={`btn btn-circle btn-sm cursor-grab`} {...listeners} tabIndex={-1}>
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        {song.song ? <SongDisplay song={song.song} width="half" /> : null}
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
