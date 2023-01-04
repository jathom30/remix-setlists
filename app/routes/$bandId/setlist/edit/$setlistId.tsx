import { faGripVertical, faPlus, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from '@remix-run/node'
import type { ShouldReloadFunction } from "@remix-run/react";
import { Outlet, useFetcher, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Breadcrumbs, CatchContainer, ErrorContainer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, MobileModal, Navbar, SaveButtons, SongDisplay } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { CSS } from "@dnd-kit/utilities";
import type { Song } from "@prisma/client";
import type { UniqueIdentifier, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import type { ReactNode } from "react";
import { useSpinDelay } from 'spin-delay';
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

  // entries is an object where the keys are the set ids and the values is an array of song ids in the correct order
  // update each set's song positionInSet?
  Object.keys(entries).forEach(async key => {
    const songIds = entries[key].toString().split(',')
    await updateSet(key, songIds)
  })

  return null
}

const subRoutes = ['addSongs', 'removeSong', 'createSet', 'saveChanges', 'confirmCancel']

// this feels like some hacky shit
export const unstable_shouldReload: ShouldReloadFunction = ({ prevUrl }) => {
  const shouldReload = subRoutes.some(route => prevUrl.pathname.includes(route))
  if (shouldReload) {
    document.location.reload()
  }
  return true
}


export default function EditSetlist() {
  const fetcher = useFetcher()
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
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


  const isLoading = useSpinDelay(fetcher.state !== 'idle')

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
        <Navbar>
          <FlexHeader>
            <Breadcrumbs breadcrumbs={[
              { label: 'Setlists', to: `/${bandId}/setlists` },
              { label: setlist.name, to: `/${bandId}/setlist/${setlist.id}` },
              { label: 'Edit', to: '.' },
            ]} />
          </FlexHeader>
        </Navbar>
      }
      footer={
        <>
          <FlexList pad={4}>
            <Link to="saveChanges" kind="primary" isSaving={isLoading} icon={faSave}>Save</Link>
          </FlexList>
          <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
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
          modifiers={[restrictToFirstScrollableAncestor]}
        >
          {Object.keys(sets).map((setId, i) => (
            <SortableContext id={setId} key={setId} items={sets[setId].map(song => ({ id: song.songId }))} strategy={verticalListSortingStrategy}>
              <DroppableArea id={setId}>
                <div className="p-4 pb-0">
                  <FlexHeader>
                    <Label>Set {i + 1} - {getSetLength(sets[setId])} minutes</Label>
                    <Link to={`${setId}/addSongs`} icon={faPlus} isOutline isCollapsing>Add songs</Link>
                  </FlexHeader>
                </div>
                <FlexList gap={2} pad={2}>
                  {sets[setId].map(song => {
                    if (!song.song) { return null }
                    return (
                      <SortableItem id={song.songId} key={song.songId} song={song} />
                    )
                  })}
                </FlexList>
              </DroppableArea>
            </SortableContext>
          ))}
          <SongOverlay isActive={!!activeId} song={getSong(activeId || '')} />
        </DndContext>
      </fetcher.Form>
      <FlexList pad={4}>
        <Link to="createSet">Create new set</Link>
      </FlexList>
    </MaxHeightContainer>
  )
}

const SongOverlay = ({ isActive, song }: { isActive: boolean, song?: SetSong }) => {
  return (
    <DragOverlay>
      {(isActive && song) ? (
        <DraggedSong song={song} />
      ) : null}
    </DragOverlay>
  )
}

const DroppableArea = ({ id, children }: { id: string; children: ReactNode }) => {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef}>{children}</div>
  )
}


const SortableItem = ({ id, song }: { id: string; song: SetSong }) => {
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

  return (
    <div style={itemStyle} ref={setNodeRef} {...attributes}>
      <DraggedSong isDragging={isDragging} song={song} listeners={listeners} />
    </div>
  )
}

const DraggedSong = ({ isDragging = false, song, listeners }: { isDragging?: boolean; song: SetSong; listeners?: SyntheticListenerMap }) => {
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
