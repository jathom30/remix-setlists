import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { FlexList, MainSidebar, MaxHeightContainer } from "~/components"
import { requireUserId } from "~/session.server"
import { Link as RemixLink, Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse, faList, faMusic, faUsers } from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { faUser } from "@fortawesome/free-regular-svg-icons"
import { getMemberRole } from "~/models/usersInBands.server";
import invariant from "tiny-invariant";
import { getBandHome, getBands } from "~/models/band.server";
import { getRecentSetlists } from "~/models/setlist.server";
import { getRecentSongs } from "~/models/song.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const [band, setlists, songs, memberRole, bands] = await Promise.all([getBandHome(bandId), getRecentSetlists(bandId), getRecentSongs(bandId), getMemberRole(bandId, userId), getBands(userId)])
  // used in useMemberRole hook in child routes
  return json({ band, setlists, songs, memberRole, bands })
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
  const { memberRole, setlists, songs, band, bands } = useLoaderData<typeof loader>()

  return (
    <MaxHeightContainer
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
        <div className="hidden sm:block sm:h-full">
          <MainSidebar band={band} memberRole={memberRole} songs={songs} setlists={setlists} bands={bands} />
        </div>

        <div className="h-full sm:hidden">
          <Outlet />
        </div>
        <div className="hidden sm:block sm:w-full sm:overflow-auto">
          <Outlet />
        </div>
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
