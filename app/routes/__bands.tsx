import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import { MaxHeightContainer, SiteHeader, FlexList } from "~/components"
import { getBands } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { Outlet, useLoaderData, Link, NavLink, useLocation } from "@remix-run/react"
import { SideBar } from "~/components/SideBar"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bands = await getBands(userId)
  if (!bands) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ bands })
}

const linkStyles = "flex items-center justify-center bg-primary w-8 h-8 rounded-md font-bold"
const activeStyles = "outline-2 outline-black outline"

export default function Bands() {
  const { bands } = useLoaderData<typeof loader>()
  const location = useLocation()
  const isActive = (path: string) => location.pathname.includes(path)

  return (
    <MaxHeightContainer
      header={<SiteHeader />}
      fullHeight
    >
      <div className="flex h-full">
        <SideBar>
          <FlexList gap={2} pad={2}>
            {bands.map(band => (
              <NavLink
                key={band.id}
                className={`${linkStyles} ${isActive(band.id) ? activeStyles : ''}`}
                style={{
                  backgroundColor: band.icon?.backgroundColor || undefined,
                  color: band.icon?.textColor || undefined,
                }}
                to={band.id}
              >
                {band.name[0]}
              </NavLink>
            ))}
            <Link className={`${linkStyles} ${isActive('new') ? activeStyles : ''}`} to="new"><FontAwesomeIcon icon={faPlus} /></Link>
          </FlexList>
        </SideBar>
        <Outlet />
      </div>
    </MaxHeightContainer>
  )
}
