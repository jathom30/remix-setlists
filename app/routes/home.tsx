import { faBoxOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useLocation, useNavigate, useNavigation } from "@remix-run/react";
import { useSpinDelay } from "spin-delay";
import { Avatar, Badge, CreateNewButton, FlexHeader, FlexList, Link, Loader, MaxHeightContainer, MaxWidth, MobileModal, Navbar, Title } from "~/components";
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

const subRoutes = ['new', 'existing', 'menu', 'user', 'delete']

export default function Home() {
  const { bands } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle')

  const hasNoBands = bands.length === 0

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <FlexList direction="row" items="center">
              <Title>Welcome</Title>
              {isSubmitting ? <Loader /> : null}
            </FlexList>
            <FlexList direction="row">
              <div className="hidden sm:block">
                <Link to="menu" kind="primary">Add band</Link>
              </div>
              <div>
                <Link to="user" isCollapsing icon={faUser} kind="ghost" aria-label="User settings menu">User</Link>
              </div>
            </FlexList>
          </FlexHeader>
        </Navbar>
      }

      footer={
        <>
          <CreateNewButton to="menu" ariaLabel="Add bands" />
          <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
        </>
      }
    >
      {hasNoBands ? (
        <FlexList pad="md">
          <FontAwesomeIcon icon={faBoxOpen} size="5x" />
          <p className="text-center">You don't have any bands added to this account.</p>
          <Link to="new">Create new band</Link>
          <Link to="existing">Add with code</Link>
        </FlexList>
      ) :
        <MaxWidth>
          <div className="grid sm:grid-cols-2 gap-2 sm:gap-4 p-4">
            {bands.map(band => (
              <NavLink to={`/${band.id}/setlists`} key={band.id} className="bg-base-100 rounded hover:bg-base-200">
                <FlexList direction="row" pad="md" items="center">
                  <Avatar size="lg" icon={band.icon} bandName={band.name} />
                  <FlexList gap="none">
                    <h2 className="text-2xl">{band.name}</h2>
                    <div>
                      <Badge>{band.members[0].role}</Badge>
                    </div>
                  </FlexList>
                </FlexList>
              </NavLink>
            ))}
          </div>
        </MaxWidth>
      }
    </MaxHeightContainer>
  )
}