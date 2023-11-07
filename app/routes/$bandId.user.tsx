import {
  faPenToSquare,
  faPlus,
  faSignOut,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useRouteError,
  useSubmit,
} from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  AvatarTitle,
  Badge,
  Button,
  CatchContainer,
  Divider,
  ErrorContainer,
  FlexHeader,
  FlexList,
  ItemBox,
  Label,
  Link,
  MaxHeightContainer,
  MaxWidth,
  MobileMenu,
  MobileModal,
  Navbar,
} from "~/components";
import { getUserWithBands } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { capitalizeFirstLetter } from "~/utils/assorted";

export const meta: MetaFunction = () => [
  {
    title: "User settings",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserWithBands(request);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);

  const formData = await request.formData();
  const bandId = formData.get("bandId")?.toString();

  if (!bandId) {
    return json({
      errors: { bandId: "A band id must be selected" },
    });
  }

  return redirect(`/${bandId}/user`);
}

const subRoutes = ["details", "password", "delete", "remove", "addBand"];

const themes = [
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
].sort();

export default function UserRoute() {
  const { user } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const { bandId } = useParams();
  const navigate = useNavigate();
  const submit = useSubmit();
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
                <Button
                  isCollapsing
                  kind="ghost"
                  type="submit"
                  icon={faSignOut}
                >
                  Sign out
                </Button>
              </Form>
            </div>
          </FlexHeader>
        </Navbar>
      }
      footer={
        <MobileModal
          open={subRoutes.some((route) => pathname.includes(route))}
          onClose={() => navigate(".")}
        >
          <Outlet />
        </MobileModal>
      }
    >
      <MaxWidth>
        <FlexList pad={4}>
          <FlexList gap={2}>
            <Label>Theme</Label>
            <select
              name="theme"
              className="select select-bordered w-full"
              data-choose-theme
            >
              <option value="">Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {capitalizeFirstLetter(theme)}
                </option>
              ))}
            </select>
          </FlexList>
          <FlexList gap={2}>
            <FlexHeader>
              <Label>User Details</Label>
              <Link kind="ghost" to="details">
                <FontAwesomeIcon icon={faPenToSquare} />
              </Link>
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
              <Link to="password" kind="ghost">
                <FontAwesomeIcon icon={faPenToSquare} />
              </Link>
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
            <FlexHeader>
              <Label>Associated bands</Label>
              <Link to="addBand" kind="outline" isCollapsing icon={faPlus}>
                Add new band
              </Link>
            </FlexHeader>
            <ItemBox>
              <Form method="put" onChange={(e) => submit(e.currentTarget)}>
                <FlexList gap={0}>
                  {user.bands.map((band) => (
                    <FlexHeader key={band.bandId}>
                      <label
                        htmlFor={band.bandId}
                        className="btn btn-ghost h-auto flex-grow justify-start p-2 normal-case font-normal"
                      >
                        <FlexList direction="row" gap={2} items="center">
                          <input
                            className="radio"
                            name="bandId"
                            id={band.bandId}
                            type="radio"
                            value={band.bandId}
                            defaultChecked={band.bandId === bandId}
                          />
                          <FlexList gap={2}>
                            <span>{band.bandName}</span>
                            <Badge>{band.role}</Badge>
                          </FlexList>
                        </FlexList>
                      </label>
                      <Link to={`remove/${band.bandId}`} kind="error" isRounded>
                        <FontAwesomeIcon icon={faTrash} />
                      </Link>
                    </FlexHeader>
                  ))}
                </FlexList>
              </Form>
            </ItemBox>
          </FlexList>

          <Divider />

          <div className="sm:hidden">
            <FlexList>
              <Form action="/logout" method="post">
                <FlexList>
                  <Button size="md" type="submit" icon={faSignOut}>
                    Sign out
                  </Button>
                </FlexList>
              </Form>
              <Divider />
            </FlexList>
          </div>

          <FlexList gap={2}>
            <Label>Support</Label>
            <ItemBox>
              <p>
                For tech support or general questions, reach out to us at{" "}
                <a
                  className="link link-accent"
                  href="mailto:support@setlists.pro"
                >
                  support@setlists.pro
                </a>
              </p>
            </ItemBox>
          </FlexList>

          <Divider />

          <FlexList gap={2}>
            <Label isDanger>Danger zone</Label>
            <ItemBox>
              <FlexList>
                <span className="font-bold">Delete your account</span>
                <p className="text-sm text-text-subdued">
                  Deleting this account is a perminant action and cannot be
                  undone.
                </p>
                <Link to="delete" kind="error">
                  Delete account
                </Link>
              </FlexList>
            </ItemBox>
          </FlexList>
        </FlexList>
      </MaxWidth>
    </MaxHeightContainer>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
