import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { CatchContainer, Drawer, ErrorContainer, FlexHeader, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongLink } from "~/components";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
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

  // const setLength = (songs: SerializeFrom<SongsInSets & { song: Song | null }>[]) => songs.reduce((total, song) => total += song.song?.length || 0, 0)

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label={setlist.name} to={to} />
          <Link to="menu" kind="invert" icon={faEllipsisV} isRounded isCollapsing>Menu</Link>
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
              <Label>Set {i + 1} - {getSetLength(set.songs)} minutes</Label>
            </FlexHeader>
          </div>
          {set.songs.map(song => {
            if (!song.song) { return null }
            return (
              <SongLink key={song.songId} song={song.song} />
            )
          })}
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