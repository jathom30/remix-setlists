import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import { MaxHeightContainer, FlexList, Avatar, Badge, Drawer, FlexHeader, Button } from "~/components"
import { getBands } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { useLoaderData, Link, NavLink, useLocation, useNavigate, Outlet, Form } from "@remix-run/react"
import { faPlusCircle, faSignOut } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bands = await getBands(userId)
  if (!bands) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ bands })
}

const linkStyles = 'p-4 border-t border-slate-300 w-full flex items-center gap-4'
const activeStyles = "bg-slate-200"

const subRoutes = ['new', 'existing', 'menu']

export default function Bands() {
  const { bands } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isActive = (path: string) => pathname.includes(path)

  return (
    <MaxHeightContainer
      header={
        <div className="p-4 border-b border-slate-300">
          <FlexHeader>
            <h1 className="text-4xl font-bold">Bands</h1>
            <Form action="/logout" method="post">
              <Button type="submit" kind="secondary" isCollapsing icon={faSignOut}>Sign out</Button>
            </Form>
          </FlexHeader>
        </div>
      }
      footer={
        <Link className={`${linkStyles} ${isActive('new') ? activeStyles : ''}`} to="menu">
          <FontAwesomeIcon size="2x" icon={faPlusCircle} />
          <h5>Add a band</h5>
        </Link>
      }
      fullHeight
    >
      <div className="bg-white h-full">
        {bands.map(band => (
          <NavLink
            key={band.id}
            className={` hover:bg-slate-200 ${isActive(band.id) ? activeStyles : ''}`}
            to={`/${band.id}/home`}
          >
            <FlexList direction="row" pad={4} items="center">
              <Avatar size="lg" icon={band.icon} bandName={band.name} />
              <FlexList gap={0}>
                <h2 className="text-2xl">{band.name}</h2>
                <div>
                  <Badge>{band.members[0].role}</Badge>
                </div>
              </FlexList>
            </FlexList>
          </NavLink>
        ))}
      </div>
      <Drawer open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
        <Outlet />
      </Drawer>
    </MaxHeightContainer>
  )
}
