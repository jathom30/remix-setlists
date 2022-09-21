import type { LoaderArgs, SerializeFrom } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import invariant from "tiny-invariant"
import { Avatar, Badge, FlexList, MaxHeightContainer } from "~/components"
import { getBand } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faHouse, faList, faMusic, faUsers } from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { faUser } from "@fortawesome/free-regular-svg-icons"
import type { Band, BandIcon } from "@prisma/client"
import { capitalizeFirstLetter } from "~/utils/assorted"

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId note found')
  const band = await getBand(bandId)
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ band })
}

const routes = [
  {
    icon: faHouse,
    label: 'Home',
    to: '.'
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
    to: '/user'
  },
]

export default function BandRoute() {
  const { band } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()

  // removes empty paths
  const splitPathname = pathname.split('/').reduce((paths: string[], path) => {
    if (path.length) {
      return [
        ...paths, path,
      ]
    }
    return paths
  }, [])
  const lastPath = splitPathname[splitPathname.length - 1]
  const showBandIcon = splitPathname.length === 1

  return (
    <MaxHeightContainer
      header={
        <div className="bg-slate-400">
          <FlexList pad={2} direction="row" items="center" justify="between">
            {showBandIcon ? (
              <BandRouteIcon band={band} />
            ) : (
              <Link className="text-white" to={`/${splitPathname.slice(0, splitPathname.length - 1).join('/')}`}>
                <FlexList direction="row" items="center" gap={2}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                  <h1 className="text-lg">{capitalizeFirstLetter(lastPath)}</h1>
                </FlexList>
              </Link>
            )}

            <Badge invert size="sm">{band.code}</Badge>
          </FlexList>
        </div>
      }
      footer={
        <div className="bg-slate-400">
          <FlexList pad={0} direction="row" items="center" justify="between">
            {routes.map(route => (
              <RouteIcon key={route.label} icon={route.icon} label={route.label} to={route.to} />
            ))}

          </FlexList>
        </div>
      }
      fullHeight
    >
      <Outlet />
    </MaxHeightContainer>
  )
}

const RouteIcon = ({ icon, label, to }: { icon: IconDefinition; label: string, to: string }) => {
  const { pathname } = useLocation()

  const isActive = pathname.includes(label.toLowerCase())

  return (
    <Link className={`p-2 ${isActive ? 'text-white' : ''}`} to={to}>
      <FlexList items="center" gap={0}>
        <FontAwesomeIcon icon={icon} />
        <span>{label}</span>
      </FlexList>
    </Link>
  )
}

const BandRouteIcon = ({ band }: { band: SerializeFrom<Band & { icon: BandIcon | null }> }) => {
  return (
    <Link to="/" className="text-white">
      <FlexList gap={2} direction="row" items="center">
        <FontAwesomeIcon icon={faChevronLeft} />
        <Avatar size="sm" band={band} />
        <h1 className="text-lg">{band.name}</h1>
      </FlexList>
    </Link>
  )
}