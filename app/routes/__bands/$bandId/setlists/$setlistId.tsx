import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";

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

export default function Setlist() {
  const { setlist } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{setlist.name}</h1>
      {setlist.sets.map(set => (
        <div key={set.id}>
          <h2>Songs</h2>
          {set.songs.map(song => (
            <p key={song.id}>{song.name}</p>
          ))}
        </div>
      ))}
    </div>
  )
}