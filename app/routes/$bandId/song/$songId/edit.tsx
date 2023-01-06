import invariant from "tiny-invariant";
import { json } from '@remix-run/node'
import type { LoaderArgs } from "@remix-run/server-runtime";
import { getSong } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { getFeels } from "~/models/feel.server";
import { useLoaderData, useParams } from "@remix-run/react";
import { SongEdit } from "~/routes/resource/songEdit";
import { CatchContainer, ErrorContainer } from "~/components";

export async function loader({ request, params }: LoaderArgs) {
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  const song = await getSong(songId, bandId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }

  return json({ song, feels })
}

export default function EditSong() {
  const { song, feels } = useLoaderData<typeof loader>()
  const { bandId } = useParams()

  return <SongEdit song={song} feels={feels} redirectTo={`/${bandId}/song/${song.id}`} />
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}