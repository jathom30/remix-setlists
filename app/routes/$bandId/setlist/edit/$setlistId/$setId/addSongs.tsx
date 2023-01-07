import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node"
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { FlexHeader, FlexList, Link, MaxHeightContainer, MulitSongSelect, SaveButtons, SearchInput, Title } from "~/components";
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
  const [params] = useSearchParams()
  const query = params.get('query')
  const hasAvailableSongs = !query ? songs.length > 0 : true

  if (!hasAvailableSongs) {
    return (
      <FlexList pad={4}>
        <h3 className="font-bold text-2xl">No available songs</h3>
        <p className="text-text-subdued text-sm">It looks like this setlist has used all your available songs.</p>
        <Link to={`../createSong`} kind="primary">Create a new song?</Link>
        <Link to="..">Cancel</Link>
      </FlexList>
    )
  }

  return (
    <FlexList>
      <div className="bg-base-100 shadow-lg p-4 relative">
        <div className="sticky top-0">
          <FlexList gap={2}>
            <FlexHeader>
              <Title>add songs to set</Title>
              {hasAvailableSongs ? <Link isOutline to="../createSong" icon={faPlus}>Create song</Link> : null}
            </FlexHeader>
            <Form method="get">
              <SearchInput defaultValue={query} />
            </Form>
          </FlexList>
        </div>
      </div>
      <MaxHeightContainer
        fullHeight
        footer={
          <SaveButtons
            saveLabel="Add songs to set"
            cancelTo=".."
          />
        }
      >
        <Form method="put" className="h-full">
          <MulitSongSelect songs={songs} />
        </Form>
      </MaxHeightContainer>
    </FlexList>
  )
}