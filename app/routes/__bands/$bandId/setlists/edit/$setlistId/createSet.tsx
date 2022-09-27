import { useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import invariant from "tiny-invariant";
import { MulitSongSelect } from "~/components";
import { getSongsNotInSetlist } from "~/models/song.server";
import { getMemberRole } from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";
import { roleEnums } from "~/utils/enums";
import { createSet } from "~/models/set.server";

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
  const { setlistId, bandId } = params
  invariant(setlistId, 'setlistId not found')
  const formData = await request.formData()
  const songIds = formData.getAll('songs').map(songId => songId.toString())

  await createSet(setlistId, songIds)
  return redirect(`/${bandId}/setlists/edit/${setlistId}`)
}

export default function CreateSet() {
  const { songs } = useLoaderData<typeof loader>()

  return <MulitSongSelect songs={songs} />
}