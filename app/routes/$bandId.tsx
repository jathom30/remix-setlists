import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { FlexList, MainSidebar, MaxHeightContainer, MainFooterLink } from "~/components"
import { requireUserId } from "~/session.server"
import { Outlet, useLoaderData } from "@remix-run/react"
import { faHouse, faList, faMusic, faUsers, faUser } from "@fortawesome/free-solid-svg-icons"
import { getMemberRole } from "~/models/usersInBands.server";
import invariant from "tiny-invariant";
import { getBandHome, getBands } from "~/models/band.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const [band, memberRole, bands] = await Promise.all([
    getBandHome(bandId), getMemberRole(bandId, userId), getBands(userId)
  ])
  // used in useMemberRole hook in child routes
  return json({ band, memberRole, bands })
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
  const { memberRole, band, bands } = useLoaderData<typeof loader>()

  return (
    <MaxHeightContainer
      footer={
        <div className="bg-base-100 text-neutral-content border-t border-base-200 py-4 sm:hidden">
          <FlexList pad={0} direction="row" items="center" justify="between">
            {routes.map(route => (
              <MainFooterLink key={route.label} icon={route.icon} label={route.label} to={route.to} />
            ))}
          </FlexList>
        </div>
      }
      fullHeight
    >
      <div className="h-full sm:flex">
        <div className="hidden sm:block sm:h-full">
          <MainSidebar band={band} memberRole={memberRole} bands={bands} />
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