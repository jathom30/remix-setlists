import { faBoxOpen, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, NavLink, Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { Avatar, Badge, Button, CreateNewButton, FlexHeader, FlexList, Link, MaxHeightContainer, MobileModal, Navbar, Title } from "~/components";
import { getBands } from "~/models/band.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bands = await getBands(userId)

  if (!bands) {
    throw new Response("Bands not found", { status: 404 })
  }
  return json({ bands })
}

const subRoutes = ['new', 'existing', 'menu', 'user']

export default function Home() {
  const { bands } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { bandId } = useParams()

  const hasNoBands = bands.length === 0

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Title>Welcome</Title>
            <FlexList direction="row">
              <div className="hidden sm:block">
                <Link to="menu" kind="primary">Add band</Link>
              </div>
              <div>
                <Form action="/logout" method="post">
                  <Button isCollapsing type="submit" icon={faSignOut}>Sign out</Button>
                </Form>
              </div>
            </FlexList>
          </FlexHeader>
        </Navbar>
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
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-4 p-4">
          {bands.map(band => (
            <NavLink to={`/${band.id}/setlists`} key={band.id} className={`rounded ${bandId === band.id ? 'bg-base-100' : ''} hover:bg-base-300`}>
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
      }
    </MaxHeightContainer>
  )
}