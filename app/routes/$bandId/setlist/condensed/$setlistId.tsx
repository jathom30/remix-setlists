import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { AvatarTitle, Breadcrumbs, CatchContainer, Divider, ErrorContainer, FlexHeader, FlexList, Label, MaxHeightContainer, MobileMenu, Navbar } from "~/components";
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

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  if (!data) {
    return {
      title: "Songs",
    }
  }
  const { setlist: { name } } = data
  return { title: name }
};

export default function CondensedSetlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId } = useParams()

  const getSetLength = (set: typeof setlist.sets[number]) => {
    return set.songs.reduce((acc, song) => {
      return acc += (song.song?.length || 0)
    }, 0)
  }

  const sortedSets = setlist.sets.sort((a, b) => a.positionInSetlist - b.positionInSetlist)
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <>
          <Navbar>
            <FlexHeader>
              <AvatarTitle title="Condensed" />
              <MobileMenu />
            </FlexHeader>
          </Navbar>
          <Navbar shrink>
            <Breadcrumbs
              breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: setlist.name, to: `/${bandId}/setlist/${setlist.id}` },
                { label: 'Condensed', to: '.' },
              ]}
            />
          </Navbar>
        </>
      }
    >
      <FlexList pad="md" gap="none">
        {sortedSets.map((set, i) => (
          <div key={set.id}>
            <Label>Set {i + 1} - {pluralize('minutes', getSetLength(set), true)}</Label>
            <FlexList gap="none">
              {set.songs.map((song) => (
                <span key={song.songId}>{song.positionInSet + 1}. {song.song?.name}</span>
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