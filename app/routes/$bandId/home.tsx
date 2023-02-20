import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import { MaxHeightContainer, FlexList, Avatar, Badge, Link, MobileModal, Title, CreateNewButton, Navbar, FlexHeader, Loader } from "~/components"
import { getBands } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { useLoaderData, Link as RemixLink, useLocation, useNavigate, Outlet, useParams, useNavigation } from "@remix-run/react"
import { useSpinDelay } from "spin-delay"
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const meta: MetaFunction = () => ({
  title: "Band select",
});

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
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle')
  const { bandId } = useParams()

  const hasNoBands = bands.length === 0

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <FlexList direction="row" items="center">
              <Title>Band select</Title>
              {isSubmitting ? <Loader /> : null}
            </FlexList>
            <div className="hidden sm:block">
              <Link to="menu" kind="primary">Add band</Link>
            </div>
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
        <div className="grid sm:grid-cols-2 gap-4 p-4">
          {bands.map(band => (
            <RemixLink to={`/${band.id}/setlists`} key={band.id} className={`btn btn-block btn-outline h-auto p-2 ${bandId === band.id ? 'outline outline-primary outline-2 outline-offset-2' : ''}`}>
              <div className="w-full flex items-center gap-4">
                <Avatar size="lg" icon={band.icon} bandName={band.name} />
                <FlexList items="start" gap="none">
                  <h2 className="text-2xl text-left">{band.name}</h2>
                  <div>
                    <Badge>{band.members[0].role}</Badge>
                  </div>
                </FlexList>
              </div>
            </RemixLink>
          ))}
        </div>
      }
    </MaxHeightContainer>
  )
}
