import { faGripVertical, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from '@remix-run/node'
import { NavLink, Outlet, useFetcher, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button, CatchContainer, Drawer, ErrorContainer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongDisplay } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { motion } from "framer-motion";
import type { Song } from "@prisma/client";
import type { UniqueIdentifier, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCenter, DragOverlay, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import type { ReactNode } from "react";
import { useState } from "react";
import { getSetLength } from "~/utils/setlists";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { moveBetweenContainers } from "~/utils/sets";
import { updateSet } from "~/models/set.server";

type SetSong = SerializeFrom<{
  songId: string;
  positionInSet: number;
  setId: string;
  song: Song | null;
}>

export async function loader({ request, params }: LoaderArgs) {
  const { setlistId, bandId } = params
  invariant(setlistId, 'setlistId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const setlist = await getSetlist(setlistId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()

  const entries = Object.fromEntries(formData.entries())

  // entries is an object where the keys are the set ids and the values is an array of song ids in the correct order
  // update each set's song positionInSet?
  Object.keys(entries).forEach(async key => {
    const songIds = entries[key].toString().split(',')
    await updateSet(key, songIds)
  })

  return null
}

const subRoutes = ['newSet', 'addSongs', 'removeSong', 'createSet']

export default function EditSetlist() {
  const fetcher = useFetcher()
  const { setlist } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const keySets = setlist.sets.reduce((acc, set) => {
    return {
      ...acc,
      [set.id]: set.songs,
    }
  }, {} as Record<string, SetSong[]>)


  const [sets, setSets] = useState(keySets)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    const overId = over?.id;

    if (!overId) {
      return;
    }

    const activeContainer = active.data.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId;

    if (!overContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setSets((items) => {
        const activeIndex = active.data.current?.sortable.index;
        const overIndex = over.data.current?.sortable.index || 0;
        const draggedSong = getSong(active.id)

        if (!draggedSong) return items
        return moveBetweenContainers(
          { ...items },
          activeContainer,
          activeIndex,
          overContainer,
          overIndex,
          draggedSong
        );
      });
    }
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      const activeContainer = active.data.current?.sortable.containerId;
      const overContainer = over.data.current?.sortable.containerId || over.id;
      const activeIndex = active.data.current?.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;

      setSets((prevSets) => {
        let newItems: Record<string, SetSong[]>;
        if (activeContainer === overContainer) {
          newItems = {
            ...prevSets,
            [overContainer]: arrayMove(
              prevSets[overContainer],
              activeIndex,
              overIndex
            )
          };
        } else {
          const draggedSong = getSong(active.id)

          if (!draggedSong) return prevSets
          newItems = moveBetweenContainers(
            prevSets,
            activeContainer,
            activeIndex,
            overContainer,
            overIndex,
            draggedSong
          );
        }

        const setsSongIds = Object.keys(newItems).reduce((acc, setId) => {
          return {
            ...acc,
            [setId]: newItems[setId].map(song => song.songId)
          }
        }, {})
        fetcher.submit(setsSongIds, { method: 'put' })
        return newItems;
      });
    }
    setActiveId(null)
  };

  const getSong = (id: UniqueIdentifier) => {
    const allSongs = setlist.sets.map(set => set.songs).flat()
    return allSongs.find(song => song.songId === id)
  }

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label={`Editing ${setlist.name}`} />
        </RouteHeader>
      }
      footer={
        <>
          <FlexList pad={4}>
            <Link to="createSet">Create new set</Link>
          </FlexList>
          <Drawer open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </Drawer>
        </>
      }
    >
      <fetcher.Form method="put">
        <DndContext
          id={setlist.id}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
          modifiers={[restrictToFirstScrollableAncestor]}
        >
          {Object.keys(sets).map((setId, i) => (
            <SortableContext id={setId} key={setId} items={sets[setId].map(song => ({ id: song.songId }))} strategy={verticalListSortingStrategy}>
              <DroppableArea id={setId}>
                <div className="p-4 pb-0">
                  <FlexHeader>
                    <Label>Set {i + 1} - {getSetLength(sets[setId])} minutes</Label>
                    <Link to={`${setId}/addSongs`} icon={faPlus} isRounded isCollapsing>Add songs</Link>
                  </FlexHeader>
                </div>
                {sets[setId].map(song => {
                  if (!song.song) { return null }
                  return (
                    <SortableItem id={song.songId} key={song.songId} song={song} />
                  )
                })}
              </DroppableArea>
            </SortableContext>
          ))}
          <SongOverlay isActive={!!activeId} song={getSong(activeId || '')} />
        </DndContext>
      </fetcher.Form>

    </MaxHeightContainer>
  )
}

const SongOverlay = ({ isActive, song }: { isActive: boolean, song?: SetSong }) => {
  return (
    <DragOverlay>
      {(isActive && song) ? (
        <DraggedSong isOverLay song={song} />
      ) : null}
    </DragOverlay>
  )
}

const DroppableArea = ({ id, children }: { id: string; children: ReactNode }) => {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="border" ref={setNodeRef}>{children}</div>
  )
}


const SortableItem = ({ id, song }: { id: string; song: SetSong }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id, transition: null });

  const initialStyles = {
    x: 0,
    y: 0,
    scale: 1,
  };

  return (
    <motion.div
      style={{ touchAction: 'none' }}
      layoutId={id}
      layout
      animate={
        transform
          ? {
            x: transform.x,
            y: transform.y,
            scale: isDragging ? 1.05 : 1,
            zIndex: isDragging ? 1 : 0,
            boxShadow: isDragging
              ? '0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
              : undefined,
          }
          : initialStyles
      }
      transition={{
        duration: !isDragging ? 0.25 : 0,
        easings: {
          type: 'spring',
        },
        scale: {
          duration: 0.25,
        },
        zIndex: {
          delay: isDragging ? 0 : 0.25,
        },
      }}


      exit={{ opacity: 0, height: 0, background: '#ff4400' }}
      ref={setNodeRef}
      {...attributes}

    >
      <DraggedSong isDragging={isDragging} song={song} listeners={listeners} />
    </motion.div>
  )
}

const DraggedSong = ({ isOverLay = false, isDragging = false, song, listeners }: { isOverLay?: boolean; isDragging?: boolean; song: SetSong; listeners?: SyntheticListenerMap }) => {
  return (
    <div className={`relative pl-4 ${isOverLay ? 'bg-white' : ''}`}>
      <FlexList gap={0} direction="row" items="center">
        <div className={`p-2 rounded ${isDragging ? 'bg-slate-200' : ''}`} {...listeners}>
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        <div className="flex items-center justify-between w-full pr-4">
          {song.song ? <SongDisplay song={song.song} /> : null}
          <NavLink to={`${song.setId}/removeSong/${song.songId}`}>
            <FontAwesomeIcon icon={faTrash} />
          </NavLink>
        </div>
      </FlexList>
      {isDragging ? <div className="absolute inset-0 bg-slate-300" /> : null}
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}
export function CatchBoundary() {
  return <CatchContainer />
}
