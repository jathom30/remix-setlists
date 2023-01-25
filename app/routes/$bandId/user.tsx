import { faPenToSquare, faSignOut, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json } from "@remix-run/node"
import { Form, Outlet, useLoaderData, useLocation, useNavigate, Link as RemixLink } from "@remix-run/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { AvatarTitle, Badge, Button, CatchContainer, Divider, ErrorContainer, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, MaxWidth, MobileMenu, MobileModal, Navbar } from "~/components";
import { getUserWithBands } from "~/models/user.server";
import { capitalizeFirstLetter } from "~/utils/assorted";

export const meta: MetaFunction = () => ({
  title: "User settings",
});

export async function loader({ request }: LoaderArgs) {
  const user = await getUserWithBands(request)

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }
  return json({ user })
}

const subRoutes = ['details', 'password', 'delete', 'remove']

const themes = ["cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"].sort()

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
            <AvatarTitle title="User" />
            <MobileMenu />
            <div className="hidden sm:block">
              <Form action="/logout" method="post">
                <Button isCollapsing kind="ghost" type="submit" icon={faSignOut}>Sign out</Button>
              </Form>
            </div>
          </FlexHeader>
        </Navbar>
      }
      footer={
        <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </MobileModal>
      }
    >
      <MaxWidth>
        <FlexList pad={4}>
          <FlexList gap={2}>
            <Label>Theme</Label>
            <select name="theme" className="select select-bordered w-full" data-choose-theme>
              <option value="">Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{capitalizeFirstLetter(theme)}</option>

              ))}
            </select>
          </FlexList>
          <FlexList gap={2}>
            <FlexHeader>
              <Label>User Details</Label>
              <Link kind="ghost" to="details"><FontAwesomeIcon icon={faPenToSquare} /></Link>
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
              <Link to="password" kind="ghost"><FontAwesomeIcon icon={faPenToSquare} /></Link>
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
                  <RemixLink className="btn btn-ghost" to={`remove/${band.bandId}`} key={band.bandId}>
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

          <div className="sm:hidden">
            <FlexList>
              <Form action="/logout" method="post">
                <FlexList>
                  <Button size="md" type="submit" icon={faSignOut}>Sign out</Button>
                </FlexList>
              </Form>
              <Divider />
            </FlexList>
          </div>

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
      </MaxWidth>
    </MaxHeightContainer>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}
export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}