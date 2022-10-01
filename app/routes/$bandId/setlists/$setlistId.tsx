import type { LoaderArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import type { Song } from "@prisma/client";
import invariant from "tiny-invariant";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { Outlet, useCatch, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { Drawer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongLink } from "~/components";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

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

  console.log(state)

  const setLength = (songs: SerializeFrom<Song>[]) => songs.reduce((total, song) => total += song.length, 0)

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
              <Label>Set {i + 1} - {setLength(set.songs)} minutes</Label>
            </FlexHeader>
          </div>
          {set.songs.map(song => (
            <SongLink key={song.id} song={song} />
          ))}
        </div>
      ))}
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: { message: string, stack: string } }) {
  return (
    <FlexList pad={4}>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </FlexList>
  );
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <div>
        <RouteHeader>
          <RouteHeaderBackLink label="Not Found" />
        </RouteHeader>
        <FlexList pad={4}>
          <h1 className="text-5xl font-bold">404</h1>
          <p>Oops...</p>
          <p>That setlist could not be found.</p>
        </FlexList>
      </div>
    )
  }
  throw new Error(`Unhandled error: ${caught.status}`)
}