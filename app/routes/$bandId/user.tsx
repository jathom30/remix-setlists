import { faPenToSquare, faSignOut, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json } from "@remix-run/node"
import { Form, Outlet, useLoaderData, useLocation, useNavigate, Link as RemixLink } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { Badge, Button, Divider, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, MobileModal, Navbar, Title } from "~/components";
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
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Title>User</Title>
            <Form action="/logout" method="post">
              <Button isCollapsing type="submit" icon={faSignOut}>Sign out</Button>
            </Form>
          </FlexHeader>
        </Navbar>
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

        <Divider />

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

        <Divider />

        <FlexList gap={2}>
          <Label>Associated bands</Label>
          <ItemBox>
            <FlexList gap={2}>
              {user.bands.map(band => (
                <RemixLink className="btn" to={`remove/${band.bandId}`} key={band.bandId}>
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

        <Divider />

        <FlexList gap={2}>
          <Label isDanger>Danger zone</Label>
          <ItemBox>
            <FlexList>
              <span className="font-bold">Delete your account</span>
              <p className="text-sm text-text-subdued">Deleting this account is a perminant action and cannot be undone.</p>
              <Link to="delete" kind="error">Delete account</Link>
            </FlexList>
          </ItemBox>
        </FlexList>
      </FlexList>
    </MaxHeightContainer>
  )
}
