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

const subRoutes = ['details', 'password', 'delete', 'remove']

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
          desktopChildren={<Title>User settings</Title>}
          action={
            <Form action="/logout" method="post">
              <Button isCollapsing type="submit" icon={faSignOut} kind="invert">Sign out</Button>
            </Form>
          }
          desktopAction={
            <Form action="/logout" method="post">
              <Button type="submit" icon={faSignOut} kind="secondary">Sign out</Button>
            </Form>
          }
        />
      }
      footer={
        <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </MobileModal>
      }
    >
      <FlexList pad={4}>
        <FlexList gap={2}>
          <FlexHeader>
            <Label>User Details</Label>
            <Link to="details"><FontAwesomeIcon icon={faPenToSquare} /></Link>
          </FlexHeader>
          <ItemBox>
            <FlexList>
              <FlexList gap={0}>
                <Label>Name</Label>
                <span>{user.name}</span>
              </FlexList>
              <FlexList gap={0}>
                <Label>Email</Label>
                <span>{user.email}</span>
              </FlexList>
            </FlexList>
          </ItemBox>
        </FlexList>

        <FlexList gap={2}>
          <FlexHeader>
            <Label>Security</Label>
            <Link to="password"><FontAwesomeIcon icon={faPenToSquare} /></Link>
          </FlexHeader>
          <ItemBox>
            <FlexList gap={0}>
              <Label>Password</Label>
              <span>************</span>
            </FlexList>
          </ItemBox>
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

        <FlexList gap={2}>
          <Label>Danger zone</Label>
          <ItemBox isDanger>
            <FlexList>
              <span className="font-bold">Delete your account</span>
              <p className="text-sm text-text-subdued">Deleting this account is a perminant action and cannot be undone.</p>
              <Link to="delete" kind="danger">Delete account</Link>
            </FlexList>
          </ItemBox>
        </FlexList>
      </FlexList>
    </MaxHeightContainer>
  )
}
