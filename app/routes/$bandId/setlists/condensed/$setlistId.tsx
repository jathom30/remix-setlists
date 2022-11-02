import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { FlexList, Label, MaxHeightContainer, RouteHeader, RouteHeaderBackLink } from "~/components";
import { getCondensedSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";

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
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={
            <RouteHeaderBackLink label="Condensed" />
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