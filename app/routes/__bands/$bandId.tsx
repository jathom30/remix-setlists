import type { LoaderArgs } from "@remix-run/server-runtime"
import { FlexList, MaxHeightContainer } from "~/components"
import { requireUserId } from "~/session.server"
import { Link, Outlet, useLocation } from "@remix-run/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse, faList, faMusic, faUsers } from "@fortawesome/free-solid-svg-icons"
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { faUser } from "@fortawesome/free-regular-svg-icons"

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request)
  return null
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
  return (
    <MaxHeightContainer
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
