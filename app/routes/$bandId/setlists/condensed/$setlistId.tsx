import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { Breadcrumbs, CatchContainer, ErrorContainer, FlexList, Label, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, Title } from "~/components";
import { getCondensedSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useLoaderData, useParams } from "@remix-run/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

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
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={<RouteHeaderBackLink label="Condensed" />}
          desktopChildren={
            <Breadcrumbs
              breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: setlist.name, to: `/${bandId}/setlists/${setlist.id}` },
                { label: 'Condensed', to: '.' },
              ]}
            />
          }
        />
      }
    >
      <FlexList pad={4} gap={0}>
        {setlist.sets.map((set, i) => (
          <div key={set.id} className="border-b border-slate-300 pb-2">
            <Label>Set {i + 1}</Label>
            <FlexList gap={0}>
              {set.songs.map(song => (
                <span key={song.songId}>{song.song?.name}</span>
              ))}
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