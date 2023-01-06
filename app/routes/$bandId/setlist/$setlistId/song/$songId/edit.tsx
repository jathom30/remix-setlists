import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime"
import invariant from "tiny-invariant"
import { CatchContainer, ErrorContainer } from "~/components";
import { getFeels } from "~/models/feel.server"
import { getSong } from "~/models/song.server"
import { SongEdit } from "~/routes/resource/songEdit";
import { requireNonSubMember } from "~/session.server"

export async function loader({ request, params }: LoaderArgs) {
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  const song = await getSong(songId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }

  return json({ song, feels })
}

export default function EditSong() {
  const { song, feels } = useLoaderData<typeof loader>()
  const { bandId, setlistId } = useParams()

  return <SongEdit song={song} feels={feels} redirectTo={`/${bandId}/setlist/${setlistId}`} />
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}