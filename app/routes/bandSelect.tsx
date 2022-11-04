import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import { MaxHeightContainer, FlexList, Avatar, Badge, FlexHeader, Button, Link, MobileModal } from "~/components"
import { getBands } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { useLoaderData, Link as RemixLink, NavLink, useLocation, useNavigate, Outlet, Form } from "@remix-run/react"
import { faPlusCircle, faSignOut } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bands = await getBands(userId)

  if (!bands) {
    throw new Response("Bands not found", { status: 404 })
  }
  return json({ bands })
}

const linkStyles = 'p-4 border-t border-slate-300 w-full flex items-center gap-4'

const subRoutes = ['new', 'existing', 'menu']

export default function Bands() {
  const { bands } = useLoaderData<typeof loader>()

  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <MaxHeightContainer
      header={
        <div className="p-4 border-b border-slate-300">
          <FlexHeader>
            <h1 className="text-4xl font-bold sm:text-2xl">Bands</h1>
            <FlexList direction="row">
              <div className="hidden sm:block">
                <Link kind="secondary" isRounded to="menu" icon={faPlusCircle}>Add a band</Link>
              </div>
              <Form action="/logout" method="post">
                <Button isRounded type="submit" kind="secondary" isCollapsing icon={faSignOut}>Sign out</Button>
              </Form>
            </FlexList>
          </FlexHeader>
        </div>
      }
      footer={
        <>
          <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
          <div className="sm:hidden">
            <RemixLink className={`${linkStyles}`} to="menu">
              <FontAwesomeIcon size="2x" icon={faPlusCircle} />
              <h5>Add a band</h5>
            </RemixLink>
          </div>
        </>
      }
      fullHeight
    >
      <div className="bg-white h-full sm:p-4">
        <div className="grid sm:grid-cols-2 sm:gap-4">
          {bands.map(band => (
            <div key={band.id} className="rounded hover:bg-slate-200 sm:border sm:shadow">
              <NavLink to={`/${band.id}/home`}>
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
            </div>
          ))}
        </div>
      </div>
    </MaxHeightContainer>
  )
}
