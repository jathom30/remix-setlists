import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import { MaxHeightContainer, FlexList, Avatar, Badge, FlexHeader, Button, Link, MobileModal, ItemBox } from "~/components"
import { getBands } from "~/models/band.server"
import { requireUser } from "~/session.server"
import { useLoaderData, Link as RemixLink, NavLink, useLocation, useNavigate, Outlet, Form } from "@remix-run/react"
import { faBoxOpen, faPlusCircle, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  const bands = await getBands(user.id)

  if (!bands) {
    throw new Response("Bands not found", { status: 404 })
  }
  return json({ bands, user })
}

const linkStyles = 'p-4 border-t border-slate-300 w-full flex items-center gap-4'

const subRoutes = ['new', 'existing', 'menu', 'user']

export default function Bands() {
  const { bands, user } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const hasNoBands = bands.length === 0

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0">
        <div className="p-4 border-b border-slate-300">
          <FlexHeader>
            <h1 className="text-4xl font-bold sm:text-2xl">Bands</h1>
            <FlexList direction="row">
              <div className="hidden sm:block">
                <Link kind="secondary" isRounded to="menu" icon={faPlusCircle}>Add a band</Link>
              </div>
              <Link isCollapsing to="user" icon={faUser}>{user.name}</Link>
            </FlexList>
          </FlexHeader>
        </div>
      </div>

      <div className="bg-white h-full overflow-auto">
        <MaxHeightContainer fullHeight footer={
          <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
        }>
          <div className="bg-white h-full sm:p-4">
            {hasNoBands ? (
              <FlexList pad={4}>
                <FontAwesomeIcon icon={faBoxOpen} size="5x" />
                <p className="text-center">You don't have any bands added to this account.</p>
                <Link to="new">Create new band</Link>
                <Link to="existing">Add with code</Link>
              </FlexList>
            ) :
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
            }
          </div>
        </MaxHeightContainer>
      </div>

      <div className="sticky bottom-0 z-10">
        {!hasNoBands ? (<div className="sm:hidden">
          <RemixLink className={`${linkStyles}`} to="menu">
            <FontAwesomeIcon size="2x" icon={faPlusCircle} />
            <h5>Add a band</h5>
          </RemixLink>
        </div>) : null}
      </div>
    </div>
  )
}
