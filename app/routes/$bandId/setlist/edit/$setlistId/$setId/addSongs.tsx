import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { MulitSongSelect } from "~/components";
import { addSongsToSet } from "~/models/set.server";
import { getSongsNotInSetlist } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId, setlistId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)
  const url = new URL(request.url)
  const q = url.searchParams.get('query')


  const songParams = {
    ...(q ? { q } : null)
  }

  const songs = await getSongsNotInSetlist(bandId, setlistId, songParams)

  return json({ songs })
}

export async function action({ request, params }: ActionArgs) {
  const { setId, bandId, setlistId } = params
  invariant(setId, 'setId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const formData = await request.formData()
  const songIds = formData.getAll('songs').map(songId => songId.toString())

  await addSongsToSet(setId, songIds)
  return redirect(`/${bandId}/setlist/edit/${setlistId}`)
}

export default function AddSongsToSet() {
  const { songs } = useLoaderData<typeof loader>()

  return <MulitSongSelect label="Add songs to set" songs={songs} />
}