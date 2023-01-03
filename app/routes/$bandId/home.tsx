import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import { MaxHeightContainer, FlexList, Avatar, Badge, Link, MobileModal, RouteHeader, Title, CreateNewButton, TextOverflow } from "~/components"
import { getBands } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { useLoaderData, NavLink, useLocation, useNavigate, Outlet, useParams } from "@remix-run/react"
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bands = await getBands(userId)

  if (!bands) {
    throw new Response("Bands not found", { status: 404 })
  }
  return json({ bands })
}

const subRoutes = ['new', 'existing', 'menu', 'user']

export default function Select() {
  const { bands } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { bandId } = useParams()

  const hasNoBands = bands.length === 0

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={
            <TextOverflow className="text-lg font-bold text-white">Band Select</TextOverflow>
          }
          desktopChildren={<Title>Bands</Title>}
          desktopAction={<Link to="menu" kind="primary">Add band</Link>}
        />
      }
      footer={
        <>
          <CreateNewButton to="menu" />
          <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
        </>
      }
    >
      {hasNoBands ? (
        <FlexList pad={4}>
          <FontAwesomeIcon icon={faBoxOpen} size="5x" />
          <p className="text-center">You don't have any bands added to this account.</p>
          <Link to="new">Create new band</Link>
          <Link to="existing">Add with code</Link>
        </FlexList>
      ) :
        <div className="grid sm:grid-cols-2 sm:gap-4 sm:p-4">
          {bands.map(band => (
            <div key={band.id} className={`rounded ${bandId === band.id ? 'bg-blue-100' : ''} hover:bg-slate-200`}>
              <NavLink to={`/${band.id}/setlists`}>
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
    </MaxHeightContainer>
  )
}
