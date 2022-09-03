import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getTempBand } from "~/models/band.server";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import { Link } from "~/components";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request)
  const band = await getTempBand('Starter Band')
  invariant(band, 'Band not found')
  const songs = await getSongs(band.id)
  return json({ songs })
}

export default function Songs() {
  const { songs } = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>The Songs</h1>
      {songs.map(song => (
        <Link key={song.id} to={song.id}>{song.name}</Link>
      ))}
    </div>
  )
}