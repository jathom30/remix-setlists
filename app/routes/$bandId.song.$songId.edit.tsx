import invariant from "tiny-invariant";
import { json } from '@remix-run/node'
import type { LoaderArgs } from "@remix-run/server-runtime";
import { getSong } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { getFeels } from "~/models/feel.server";
import { isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";
import { SongEdit } from "~/routes/resource.songEdit";
import { CatchContainer, ErrorContainer } from "~/components";

export async function loader({ request, params }: LoaderArgs) {
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  const response = await getSong(songId, bandId)
  const song = response?.song
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

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return (
      <ErrorContainer error={error as Error} />
    )
  }
  return <CatchContainer status={error.status} data={error.data} />
}