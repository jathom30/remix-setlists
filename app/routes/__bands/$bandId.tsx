import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import invariant from "tiny-invariant"
import { Collapsible, CollapsibleHeader, FlexList, MaxHeightContainer, MaxWidth } from "~/components"
import { getBand } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { SideBar } from "~/components/SideBar"
import { getSetlists } from "~/models/setlist.server"
import { getSongs } from "~/models/song.server"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCog } from "@fortawesome/free-solid-svg-icons"

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId note found')
  const band = await getBand(bandId)
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }
  const setlists = await getSetlists(band.id)
  const songs = await getSongs(band.id)
  return json({ band, setlists, songs })
}

export default function Band() {
  const { band, setlists, songs } = useLoaderData<typeof loader>()
  const [showSongs, setShowSongs] = useState(true)
  const [showSetlists, setShowSetlists] = useState(true)

  const { pathname } = useLocation()
  const isActive = (path: string) => pathname.includes(path)
  const activeClass = "border-r-primary bg-slate-100"

  return (
    <MaxHeightContainer
      fullHeight
    >
      <div className="flex h-full w-full">
        <SideBar>
          <div className="w-40 h-full">
            <MaxHeightContainer
              header={
                <Link to="." className="flex items-center justify-between border-b border-component-border whitespace-nowrap p-2 font-bold hover:bg-slate-100">
                  {band.name}
                  <FontAwesomeIcon icon={faCog} />
                </Link>
              }
              fullHeight
            >
              <FlexList gap={0}>
                <Collapsible
                  isOpen={showSetlists}
                  header={
                    <CollapsibleHeader isOpen={showSetlists} label="Setlists" onClick={() => setShowSetlists(!showSetlists)} newTo="setlists/new" />
                  }
                >
                  <FlexList pad={2} items="end">
                    <span className="px-2 border text-xs text-text-subdued">MOST RECENT</span>
                  </FlexList>
                  <FlexList gap={0}>
                    {setlists.map(setlist => (
                      <Link key={setlist.id} to={`setlists/${setlist.id}`} className={`p-2 hover:bg-slate-100 ${isActive(setlist.id) ? activeClass : ''}`}>{setlist.name}</Link>
                    ))}
                  </FlexList>
                </Collapsible>
                <Collapsible
                  isOpen={showSongs}
                  header={
                    <CollapsibleHeader isOpen={showSongs} label="Songs" onClick={() => setShowSongs(!showSongs)} newTo="songs/new" />
                  }
                >
                  <FlexList pad={2} items="end">
                    <span className="px-2 border text-xs text-text-subdued">MOST RECENT</span>
                  </FlexList>
                  <FlexList gap={0}>
                    {songs.map(song => (
                      <Link key={song.id} to={`songs/${song.id}`} className={`p-2 border-r-4 border-r-transparent hover:bg-slate-100 ${isActive(song.id) ? activeClass : ''}`}>{song.name}</Link>
                    ))}
                  </FlexList>
                </Collapsible>
              </FlexList>
            </MaxHeightContainer>
          </div>
        </SideBar>
        <MaxWidth>
          <Outlet />
        </MaxWidth>
      </div>
    </MaxHeightContainer>
  )
}
