import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { CatchContainer, ErrorContainer, FlexHeader, Label, Link, MaxHeightContainer, MobileModal, RouteHeader, RouteHeaderBackLink, SongLink } from "~/components";
import { faDatabase, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { getSetLength } from "~/utils/setlists";

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

const subRoutes = ['rename', 'edit', 'condensed', 'data', 'delete', 'menu']

export default function Setlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { pathname, state } = useLocation()
  const navigate = useNavigate()
  const [to] = useState(state as string)

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={
            <>
              <RouteHeaderBackLink label={setlist.name} to={to} />
              <Link to="menu" kind="invert" icon={faEllipsisV} isRounded isCollapsing>Menu</Link>
            </>
          }
          desktopChildren={<RouteHeaderBackLink invert={false} label={setlist.name} to={to} />}
          desktopAction={<Link to="menu" icon={faEllipsisV} isRounded isCollapsing>Menu</Link>}
        />
      }
      footer={
        <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </MobileModal>
      }
    >
      {setlist.sets.map((set, i) => (
        <div key={set.id} className="border-b border-slate-300">
          <div className="p-4 pb-0">
            <FlexHeader>
              <Label>Set {i + 1} - {getSetLength(set.songs)} minutes</Label>
              <Link to={`data/${set.id}`} isCollapsing isRounded icon={faDatabase}>Data metrics</Link>
            </FlexHeader>
          </div>
          <div className="flex flex-col sm:p-2 sm:gap-2">
            {set.songs.map(song => {
              if (!song.song) { return null }
              return (
                <div key={song.songId} className="sm:rounded sm:overflow-hidden">
                  <SongLink song={song.song} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}