import type { ActionArgs } from "@remix-run/node";
import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { SaveButtons, SetlistDndInterface } from "~/components";
import { getSongs } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";

import { createSetlistWithMultipleSets } from "~/models/setlist.server";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId)
  await requireNonSubMember(request, bandId)

  const songs = await getSongs(bandId)
  return json({ songs })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId)
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const entries = formData.entries()

  // key is position in setlist, value is array of song ids
  const sets: Record<string, string[]> = {}
  for (const entry of entries) {
    const [index, songIds] = entry
    if (typeof songIds !== 'string') { return null }
    sets[index] = songIds.split(',')
  }
  // remove any sets that do not have songs
  const cleanedSets = Object.entries(sets).reduce((all: Record<string, string[]>, [positionInSetlist, songIds]) => {
    // remove "empty" song ids
    const cleanedSongIds = songIds.filter(id => Boolean(id))
    if (!cleanedSongIds.length) {
      return all
    }
    return { ...all, [positionInSetlist]: cleanedSongIds }
  }, {})
  const setlist = await createSetlistWithMultipleSets(bandId, cleanedSets)

  return redirect(`/${bandId}/setlist/${setlist.id}/rename`)
}

export default function Fresh() {
  const { songs } = useLoaderData<typeof loader>()

  return (
    <Form method="post" className="h-full flex flex-col">
      <SetlistDndInterface songs={songs} />
      <SaveButtons saveLabel="Create setlist" />
    </Form>
  )
}
