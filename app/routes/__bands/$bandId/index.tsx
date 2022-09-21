import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { FlexList, Collapsible, CollapsibleHeader, SongLink } from "~/components"
import { requireUserId } from "~/session.server";
import { Link, useLoaderData } from "@remix-run/react";
import { getSetlists } from "~/models/setlist.server";
import { getSongs } from "~/models/song.server";
import { useState } from "react";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId note found')

  const setlists = await getSetlists(bandId)
  const songs = await getSongs(bandId)
  return json({ setlists, songs })
}

export default function BandIndex() {
  const { setlists, songs } = useLoaderData<typeof loader>()
  const [showSetlists, setShowSetlists] = useState(true)
  const [showSongs, setShowSongs] = useState(true)
  return (
    <FlexList gap={0}>
      <div className="border-b border-slate-300 w-full">
        <Collapsible
          header={
            <CollapsibleHeader isOpen={showSetlists} onClick={() => setShowSetlists(!showSetlists)}>
              <FlexList gap={0}>
                <span className="text-sm font-bold">Setlists</span>
                <span className="uppercase text-text-subdued text-sm">Most recent</span>
              </FlexList>
            </CollapsibleHeader>
          }
          isOpen={showSetlists}
        >
          <SetlistLink />
        </Collapsible>
      </div>

      <div className="border-b border-slate-300 w-full">
        <Collapsible
          header={
            <CollapsibleHeader isOpen={showSongs} onClick={() => setShowSongs(!showSongs)}>
              <FlexList gap={0} items="start">
                <span className="text-sm font-bold">Songs</span>
                <span className="uppercase text-text-subdued text-sm">Most recent</span>
              </FlexList>
            </CollapsibleHeader>
          }
          isOpen={showSongs}
        >
          {songs.map(song => (
            <SongLink key={song.id} song={song} />
          ))}
        </Collapsible>
      </div>
    </FlexList>
  )
}

const SetlistLink = () => {
  return (
    <Link className="hover:bg-slate-200" to=".">
      <FlexList pad={{ x: 4, y: 2 }} gap={0}>
        <span className="font-bold">First Setlist</span>
        <FlexList direction="row" justify="between">
          <span className="text-xs text-text-subdued">Two 45 minute sets</span>
          <span className="text-xs text-text-subdued whitespace-nowrap">Jan 1, 2022</span>
        </FlexList>
      </FlexList>
    </Link>
  )
}
