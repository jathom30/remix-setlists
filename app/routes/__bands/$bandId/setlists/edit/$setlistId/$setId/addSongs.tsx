import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { MulitSongSelect } from "~/components";
import { addSongsToSet } from "~/models/set.server";
import { getSongsNotInSetlist } from "~/models/song.server";
import { getMemberRole } from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";
import { roleEnums } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const { bandId, setlistId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  const url = new URL(request.url)
  const q = url.searchParams.get('query')

  const role = await getMemberRole(bandId, userId)
  const isSub = role === roleEnums.sub

  if (isSub) {
    throw new Response('Access denied', { status: 404 })
  }

  const songParams = {
    ...(q ? { q } : null)
  }

  const songs = await getSongsNotInSetlist(setlistId, songParams)

  return json({ songs })
}

export async function action({ request, params }: ActionArgs) {
  const { setId, bandId, setlistId } = params
  invariant(setId, 'setId not found')
  const formData = await request.formData()
  const songIds = formData.getAll('songs').map(songId => songId.toString())

  await addSongsToSet(setId, songIds)
  return redirect(`/${bandId}/setlists/edit/${setlistId}`)
}

export default function AddSongsToSet() {
  const { songs } = useLoaderData<typeof loader>()

  return <MulitSongSelect songs={songs} />
}