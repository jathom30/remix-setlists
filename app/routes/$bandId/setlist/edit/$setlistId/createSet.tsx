import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import invariant from "tiny-invariant";
import { FlexHeader, FlexList, Link, MaxHeightContainer, MaxWidth, MulitSongSelect, SaveButtons, SearchInput, Title } from "~/components";
import { getSongsNotInSetlist } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { createSet } from "~/models/set.server";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

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
  const { setlistId, bandId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)
  const formData = await request.formData()
  const songIds = formData.getAll('songs').map(songId => songId.toString())

  const url = new URL(request.url)
  const position = url.searchParams.get('position')?.toString() || '1'

  await createSet(setlistId, songIds, parseInt(position))
  // ? Redirects to an intermediate route that quickly redirects to edit view
  return redirect(`/${bandId}/setlist/loadingSetlist?setlistId=${setlistId}`)
}

export default function CreateSet() {
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
    <MaxHeightContainer
      fullHeight
      header={
        <div className="bg-base-100 shadow-lg p-4">
          <FlexList gap={2}>
            <FlexHeader>
              <Title>New set</Title>
              {hasAvailableSongs ? <Link isOutline to="../createSong" icon={faPlus}>Create song</Link> : null}
            </FlexHeader>
            <Form method="get">
              <SearchInput defaultValue={query} />
            </Form>
          </FlexList>
        </div>
      }
    >
      <Form method="put">
        <MaxHeightContainer
          fullHeight
          footer={
            <SaveButtons
              saveLabel="Create set"
              cancelTo=".."
            />
          }
        >
          <MaxWidth>
            <MulitSongSelect songs={songs} />
          </MaxWidth>
        </MaxHeightContainer>
      </Form>
    </MaxHeightContainer>
  )
}