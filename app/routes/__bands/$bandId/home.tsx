import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { FlexList, Collapsible, CollapsibleHeader, SongLink, MaxHeightContainer, Avatar, Badge, RouteHeader, RouteHeaderBackLink, CreateNewButton, Drawer, SetlistLink } from "~/components"
import { requireUserId } from "~/session.server";
import { Outlet, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { getRecentSetlists } from "~/models/setlist.server";
import { getRecentSongs } from "~/models/song.server";
import { getBand } from "~/models/band.server";
import { getMemberRole } from "~/models/usersInBands.server";
import { roleEnums } from "~/utils/enums";
import { useState } from "react";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId note found')

  const role = await getMemberRole(bandId, userId)
  const band = await getBand(bandId)
  const setlists = await getRecentSetlists(bandId)
  const songs = await getRecentSongs(bandId)
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ band, setlists, songs, isSub: role === roleEnums.sub })
}

export default function BandIndex() {
  const { band, setlists, songs, isSub } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [showSetlists, setShowSetlists] = useState(true)
  const [showSongs, setShowSongs] = useState(true)

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink
            label={band.name}
            to="/bandSelect"
          >
            <Avatar size="sm" bandName={band.name} icon={band.icon} />
          </RouteHeaderBackLink>
          <Badge invert size="sm">{band.members.find(m => m.bandId === band.id)?.role}</Badge>
        </RouteHeader>
      }
    >
      <div className="h-full">
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
              {setlists.map(setlist => (
                <SetlistLink key={setlist.id} setlist={setlist} />
              ))}
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
      </div>
      {!isSub ? <CreateNewButton to="new" /> : null}
      <Drawer open={pathname.includes('new')} onClose={() => navigate('.')}>
        <Outlet />
      </Drawer>
    </MaxHeightContainer>
  )
}
