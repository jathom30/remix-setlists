import { faGripVertical, faPlus, faSave, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button, Drawer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongDisplay } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";

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

const subRoutes = ['newSet', 'addSongs', 'removeSong']

export default function EditSetlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId, setlistId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label="Edit" to={`/${bandId}/setlists/${setlistId}`} />
          <Button isCollapsing isRounded icon={faSave} kind="primary">Save changes</Button>
        </RouteHeader>
      }
      footer={
        <Drawer open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </Drawer>
      }
    >
      {setlist.sets.map((set, i) => (
        <div key={set.id} className="border-b border-slate-300">
          <div className="p-4 pb-0">
            <FlexHeader>
              <FlexList direction="row" items="center">
                <Label>Set {i + 1} - {set.length} minutes</Label>
              </FlexList>
              <Link to={`addSongs/${set.id}`} icon={faPlus} isRounded isCollapsing>Add songs</Link>
            </FlexHeader>
          </div>
          {set.songs.map(song => (
            <FlexList key={song.id} gap={2} direction="row" items="center" pad={{ x: 4, y: 0 }}>
              <FontAwesomeIcon icon={faGripVertical} />
              <SongDisplay song={song} />
              <NavLink to={`removeSong/${song.id}`}>
                <FontAwesomeIcon icon={faTrash} />
              </NavLink>
            </FlexList>
          ))}
        </div>
      ))}
      <FlexList pad={4}>
        <Button>Create new set</Button>
      </FlexList>
    </MaxHeightContainer>
  )
}



// TODO
// * Get setlist in loader
// * Update SongLink to include drag handle and delete button
// * Add Song button across from set number
// * Create new set button after all sets
// * Outlet to add song/new set drawer with multi select