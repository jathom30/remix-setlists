import { faGripVertical, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from '@remix-run/node'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { NavLink, Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Drawer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongDisplay } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { AnimatePresence, motion } from "framer-motion";
import type { Song } from "@prisma/client";

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
      <DragDropContext onDragEnd={console.log}>
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
            <Droppable key={set.id} droppableId={set.id} type="SONG">
              {(provided, snapshot) => (
                <div
                  className={`border-b border-slate-300 ${snapshot.isDraggingOver ? 'bg-slate-200' : ''}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <AnimatePresence>
                    {set.songs.map((song, index) => (
                      <Draggable key={song.id} draggableId={song.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'bg-white' : ''}
                          >
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0, background: '#ff4400' }}
                              transition={{ opacity: .2 }}
                            >
                              <FlexList key={song.id} gap={2} direction="row" items="center" pad={{ x: 4, y: 0 }}>
                                <FontAwesomeIcon icon={faGripVertical} />
                                <SongDisplay song={song} />
                                <NavLink to={`${set.id}/removeSong/${song.id}`}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </NavLink>
                              </FlexList>
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </MaxHeightContainer>
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