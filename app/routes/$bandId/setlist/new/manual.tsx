import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from '@remix-run/node'
import invariant from "tiny-invariant";
import { CatchContainer, ErrorContainer, MulitSongSelect } from "~/components";
import { getSongs } from "~/models/song.server";
import { useLoaderData } from "@remix-run/react";
import { createSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId)
  await requireNonSubMember(request, bandId)

  const songs = await getSongs(bandId)
  return json({ songs })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const formData = request.formData()
  const songIds = (await formData).getAll('songs').map(songId => songId.toString())

  const setlist = await createSetlist(bandId, songIds)
  return redirect(`/${bandId}/setlist/${setlist.id}/rename`)
}

export default function ManualSetlistCreation() {
  const { songs } = useLoaderData<typeof loader>()
  return (
    <MulitSongSelect songs={songs} label="Create setlist" />
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}