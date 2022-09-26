import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { FlexList, Label, MaxHeightContainer, RouteHeader, RouteHeaderBackLink } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useLoaderData, useParams } from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { setlistId } = params
  invariant(setlistId, 'setlistId not found')

  const setlist = await getSetlist(setlistId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

export default function CondensedSetlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId, setlistId } = useParams()
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label="Condensed" to={`/${bandId}/setlists/${setlistId}`} />
        </RouteHeader>
      }
    >
      <FlexList pad={4} gap={0}>
        {setlist.sets.map((set, i) => (
          <div key={set.id} className="border-b border-slate-300 pb-2">
            <Label>Set {i + 1}</Label>
            <FlexList gap={0}>
              {set.songs.map(song => (
                <span key={song.id}>{song.name}</span>
              ))}
            </FlexList>
          </div>
        ))}
      </FlexList>
    </MaxHeightContainer>
  )
}