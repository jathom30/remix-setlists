import { faGripVertical, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Drawer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongDisplay } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { AnimatePresence, motion } from "framer-motion";
import type { Song } from "@prisma/client";
import type { DragEndEvent } from "@dnd-kit/core";
import { rectIntersection } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)

  const setlistId = params.setlistId
  invariant(setlistId, 'setlistId not found')

  const setlist = await getSetlist(setlistId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

const subRoutes = ['newSet', 'addSongs', 'removeSong', 'createSet']

export default function EditSetlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const setLength = (songs: SerializeFrom<Song>[]) => {
    return songs.reduce((total, song) => total += song.length, 0)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    console.log(event)
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
      <DndContext
        id={setlist.id}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={rectIntersection}
      >
        {setlist.sets.map((set, i) => (
          <div key={set.id} className="border-b border-slate-300">
            <div className="p-4 pb-0">
              <FlexHeader>
                <FlexList direction="row" items="center">
                  <Label>Set {i + 1} - {setLength(set.songs)} minutes</Label>
                </FlexList>
                <Link to={`${set.id}/addSongs`} icon={faPlus} isRounded isCollapsing>Add songs</Link>
              </FlexHeader>
            </div>

            <div className={`border-b border-slate-300`}>
              <SortableContext id={set.id} items={set.songs} strategy={verticalListSortingStrategy}>
                <AnimatePresence>
                  {set.songs.map((song) => (
                    <SortableSong song={song} setId={set.id} key={song.id} />
                  ))}
                </AnimatePresence>
              </SortableContext>
            </div>

          </div>
        ))}
      </DndContext>

    </MaxHeightContainer>
  )
}

const SortableSong = ({ song, setId }: { song: SerializeFrom<Song>; setId: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: song.id, transition: null });

  const initialStyles = {
    x: 0,
    y: 0,
    scale: 1,
  };

  return (
    <motion.div
      layoutId={song.id}
      // initial={{ opacity: 0, height: 0 }}
      // animate={{ opacity: 1, height: 'auto' }}
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
      {...listeners}
    >
      <FlexList key={song.id} gap={2} direction="row" items="center" pad={{ x: 4, y: 0 }}>
        <FontAwesomeIcon icon={faGripVertical} />
        <SongDisplay song={song} />
        <NavLink to={`${setId}/removeSong/${song.id}`}>
          <FontAwesomeIcon icon={faTrash} />
        </NavLink>
      </FlexList>
    </motion.div>
  )
}

export function ErrorBoundary() {
  return (
    <div>Error</div>
  )
}
export function CatchBoundary() {
  return (
    <div>Error</div>
  )
}
