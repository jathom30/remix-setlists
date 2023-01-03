import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { Breadcrumbs, CatchContainer, Divider, ErrorContainer, FlexHeader, FlexList, Label, MaxHeightContainer, Navbar } from "~/components";
import { getCondensedSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useLoaderData, useParams } from "@remix-run/react";
import pluralize from "pluralize";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { setlistId } = params
  invariant(setlistId, 'setlistId not found')

  const setlist = await getCondensedSetlist(setlistId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

export default function CondensedSetlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId } = useParams()

  const getSetLength = (set: typeof setlist.sets[number]) => {
    return set.songs.reduce((acc, song) => {
      return acc += (song.song?.length || 0)
    }, 0)
  }
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Breadcrumbs
              breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: setlist.name, to: `/${bandId}/setlist/${setlist.id}` },
                { label: 'Condensed', to: '.' },
              ]}
            />
          </FlexHeader>
        </Navbar>
      }
    >
      <FlexList pad={4} gap={0}>
        {setlist.sets.map((set, i) => (
          <div key={set.id}>
            <Label>Set {i + 1} - {pluralize('minues', getSetLength(set), true)}</Label>
            <FlexList gap={0}>
              {set.songs.map(song => (
                <span key={song.songId}>{song.song?.name}</span>
              ))}
              <Divider />
            </FlexList>
          </div>
        ))}
      </FlexList>
    </MaxHeightContainer>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}