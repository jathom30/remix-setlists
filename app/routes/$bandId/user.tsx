import { faPenToSquare, faSignOut, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json } from "@remix-run/node"
import { Form, Outlet, useLoaderData, useLocation, useNavigate, useParams, Link as RemixLink } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { Badge, Button, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, MobileModal, RouteHeader, RouteHeaderBackLink, Title } from "~/components";
import { getUserWithBands } from "~/models/user.server";

export async function loader({ request }: LoaderArgs) {
  const user = await getUserWithBands(request)

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }
  return json({ user })
}

const subRoutes = ['edit', 'remove']

export default function UserRoute() {
  const { user } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={
            <RouteHeaderBackLink label="User" to={`/${bandId}/home`} />
          }
          action={<Link to="edit" kind="invert" icon={faPenToSquare} isRounded isCollapsing>Edit user</Link>}
          desktopChildren={<Title>User settings</Title>}
          desktopAction={<Link to="edit" kind="secondary" icon={faPenToSquare} isRounded isCollapsing>Edit user</Link>}
        />
      }
      footer={
        <>
          <Form action="/logout" method="post">
            <FlexList pad={4}>
              <Button type="submit" icon={faSignOut}>Sign out</Button>
            </FlexList>
          </Form>
          <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <FlexList pad={4}>
        <FlexList gap={0}>
          <Label>Name</Label>
          <span>{user.name}</span>
        </FlexList>
        <FlexList gap={2}>
          <Label>Associated bands</Label>
          <ItemBox pad={2}>
            <FlexList gap={0}>
              {user.bands.map(band => (
                <RemixLink className="p-2 rounded hover:bg-slate-100" to={`remove/${band.bandId}`} key={band.bandId}>
                  <FlexHeader>
                    <FlexList direction="row" items="center">
                      <FontAwesomeIcon icon={faTrash} />
                      <span>{band.bandName}</span>
                    </FlexList>
                    <Badge>{band.role}</Badge>
                  </FlexHeader>
                </RemixLink>
              ))}
            </FlexList>
          </ItemBox>
        </FlexList>
      </FlexList>
    </MaxHeightContainer>
  )
}