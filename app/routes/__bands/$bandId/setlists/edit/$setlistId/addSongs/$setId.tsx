import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { json } from "@remix-run/node"
import { Form, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { Button, FlexList, Input, SaveButtons, SongDisplay } from "~/components";
import { addSongsToSet } from "~/models/set.server";
import { getSetlist } from "~/models/setlist.server";
import { getSongs } from "~/models/song.server";
import { getMemberRole } from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";
import { roleEnums } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
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

  const songs = await getSongs(bandId, songParams)

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
  const { setlistId, bandId } = useParams()
  const [params, setParams] = useSearchParams()
  const searchParam = params.get('query')

  return (
    <Form method="put" action="." className="w-full">
      <FlexList gap={0}>
        <div className="border-b border-slate-300 p-4 w-full">
          <FlexList gap={2}>
            <span>Available songs</span>
            <Input name="query" placeholder="Search..." defaultValue={searchParam || ''} onChange={e => setParams({ query: e.target.value })} />
          </FlexList>
        </div>
        <FlexList gap={0}>
          {songs.map(song => (
            <label key={song.id} htmlFor={song.id} className="hover:bg-slate-200">
              <FlexList direction="row" gap={0}>
                <input id={song.id} value={song.id} type="checkbox" name="songs" className="ml-4" />
                <SongDisplay song={song} />
              </FlexList>
            </label>
          ))}
        </FlexList>
      </FlexList>
      <SaveButtons
        saveLabel="Add songs to set"
        cancelTo={`/${bandId}/setlists/edit/${setlistId}`}
      />
    </Form>
  )
}