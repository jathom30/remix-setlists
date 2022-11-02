import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { Badge, Collapsible, CollapsibleHeader, FlexList, Link, MaxHeightContainer, SetlistLink, SongLink, TextOverflow } from "~/components"
import { requireUserId } from "~/session.server"
import { Link as RemixLink, Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faCog, faHouse, faList, faMusic, faPlus, faUsers } from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { faUser } from "@fortawesome/free-regular-svg-icons"
import { getMemberRole } from "~/models/usersInBands.server";
import invariant from "tiny-invariant";
import { useUser } from "~/utils";
import { getBandHome } from "~/models/band.server";
import { getRecentSetlists } from "~/models/setlist.server";
import { getRecentSongs } from "~/models/song.server";
import { useState } from "react";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const [band, setlists, songs, memberRole] = await Promise.all([getBandHome(bandId), getRecentSetlists(bandId), getRecentSongs(bandId), getMemberRole(bandId, userId)])
  // used in useMemberRole hook in child routes
  return json({ band, setlists, songs, memberRole })
}

const routes = [
  {
    icon: faHouse,
    label: 'Home',
    to: 'home'
  },
  {
    icon: faList,
    label: 'Setlists',
    to: 'setlists'
  },
  {
    icon: faMusic,
    label: 'Songs',
    to: 'songs'
  },
  {
    icon: faUsers,
    label: 'Band',
    to: 'band'
  },
  {
    icon: faUser,
    label: 'User',
    to: 'user'
  },
]

export default function BandRoute() {
  const { memberRole, setlists, songs, band } = useLoaderData<typeof loader>()
  const user = useUser()
  const [showSongs, setShowSongs] = useState(true)
  const [showSetlists, setShowSetlists] = useState(true)

  return (
    <MaxHeightContainer
      header={
        <div className="hidden shadow-md sm:flex items-center justify-between p-2">
          <Link to="/bandSelect" icon={faChevronLeft} kind="secondary">Band select</Link>
          <Link to="user" kind="secondary" icon={faUser}>{user.name}</Link>
        </div>
      }
      footer={
        <div className="bg-slate-400 sm:hidden">
          <FlexList pad={0} direction="row" items="center" justify="between">
            {routes.map(route => (
              <RouteIcon key={route.label} icon={route.icon} label={route.label} to={route.to} />
            ))}
          </FlexList>
        </div>
      }
      fullHeight
    >
      <div className="h-full sm:flex">
        <div className="hidden sm:border-r sm:bg-white sm:w-full sm:max-w-xs sm:flex sm:shadow-md sm:z-10">
          <MaxHeightContainer
            header={
              <div className="bg-white">
                <FlexList gap={2} direction="row" justify="between" items="center">
                  <RemixLink className="w-full hover:bg-slate-200" to="home">
                    <FlexList pad={2} gap={0}>
                      <TextOverflow className="font-bold text-lg">{band?.name}</TextOverflow>
                      <Badge size="md">{memberRole}</Badge>
                    </FlexList>
                  </RemixLink>
                  <RemixLink className="rounded-full p-2 mr-2 hover:bg-slate-200" to="band">
                    <FontAwesomeIcon size="2x" icon={faCog} />
                  </RemixLink>
                </FlexList>
              </div>
            }>
            <div className="border-b border-slate-300">
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
              <FlexList direction="row" pad={4} gap={2}>
                <Link className="grow" to="setlists">All setlists</Link>
                <Link to="setlists/new" kind="primary">
                  <FontAwesomeIcon icon={faPlus} />
                </Link>
              </FlexList>
            </div>
            <div className="border-b border-slate-300">
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
              <FlexList direction="row" pad={4} gap={2}>
                <Link className="grow" to="songs">All songs</Link>
                <Link to="songs/new" kind="primary">
                  <FontAwesomeIcon icon={faPlus} />
                </Link>
              </FlexList>
            </div>
          </MaxHeightContainer>
        </div>
        <div className="h-full sm:hidden">
          <Outlet />
        </div>
        <div className="hidden sm:block sm:w-full sm:overflow-auto">
          <Outlet />
        </div>
        {/* <div className="hidden sm:block sm:col-span-2 lg:col-span-3">
          <Outlet />
        </div> */}
      </div>
    </MaxHeightContainer>
  )
}

const RouteIcon = ({ icon, label, to }: { icon: IconDefinition; label: string, to: string }) => {
  const { pathname } = useLocation()

  const isActive = pathname.includes(label.toLowerCase())

  return (
    <RemixLink className={`p-2 ${isActive ? 'text-white' : ''}`} to={to}>
      <FlexList items="center" gap={0}>
        <FontAwesomeIcon icon={icon} />
        <span>{label}</span>
      </FlexList>
    </RemixLink>
  )
}
