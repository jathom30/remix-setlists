import { faAdd, faBoxOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { useSpinDelay } from "spin-delay";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar as OgAvatar,
  Badge as OgBadge,
  CreateNewButton,
  FlexHeader,
  FlexList,
  Link,
  Loader,
  MaxHeightContainer,
  MaxWidth,
  MobileModal,
  Navbar,
  Title,
} from "~/components";
import { H1, H3, Small } from "~/components/typography";
import { getBands } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { useFeatureFlags, useUser } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const bands = await getBands(userId);

  if (!bands) {
    throw new Response("Bands not found", { status: 404 });
  }
  return json({ bands });
}

const subRoutes = ["new", "existing", "menu", "user", "delete"];

export default function Home() {
  const { rebranding } = useFeatureFlags();
  if (rebranding) {
    return <HomeNew />;
  }
  return <HomeOld />;
}

const HomeNew = () => {
  const { bands } = useLoaderData<typeof loader>();
  const user = useUser();
  // const { pathname } = useLocation();
  // const navigate = useNavigate();
  // const navigation = useNavigation();
  // const isSubmitting = useSpinDelay(navigation.state !== "idle");

  const hasNoBands = bands.length === 0;
  return (
    <div>
      <div className="sticky top-0 bg-background inset-x-0 flex items-center justify-end p-2 gap-2">
        <Button size="sm" asChild>
          <Link to="new">
            <FontAwesomeIcon icon={faAdd} className="mr-2" />
            Add Band
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              {user.name
                ?.split(" ")
                .map((n) => n[0].toUpperCase())
                .join(" ")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="user">User Settings</Link>
            </DropdownMenuItem>
            <form method="post" action="/logout">
              <DropdownMenuItem asChild className="w-full">
                <button type="submit">Logout</button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <MaxWidth className="p-2 space-y-2">
        <H1>Your Bands</H1>
        {hasNoBands ? (
          <NavLink to="new">
            <Card className="hover:bg-accent hover:text-accent-foreground">
              <CardHeader className="flex-row gap-4 items-center flex-wrap">
                <H3>Create New</H3>
                <div className="flex-grow" />
                <Small>
                  You have no bands. Click here to create or add a band to your
                  account.
                </Small>
              </CardHeader>
            </Card>
          </NavLink>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
            {bands.map((band) => (
              <NavLink to={`/${band.id}/setlists`} key={band.id}>
                <Card className="hover:bg-accent hover:text-accent-foreground">
                  <CardHeader className="flex-row gap-4 flex-wrap">
                    {band.icon?.path ? (
                      <Avatar>
                        <AvatarImage src={band.icon.path} alt={band.name} />
                      </Avatar>
                    ) : null}
                    <H3>{band.name}</H3>
                    <div className="flex-grow" />
                    <Badge variant="outline">
                      {
                        band.members.find((member) => member.userId === user.id)
                          ?.role
                      }
                    </Badge>
                    <Badge variant="secondary">
                      {band.members.length}{" "}
                      {band.members.length === 1 ? "Member" : "Members"}
                    </Badge>
                  </CardHeader>
                </Card>
              </NavLink>
            ))}
          </div>
        )}
      </MaxWidth>
    </div>
  );
};

const HomeOld = () => {
  const { bands } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = useSpinDelay(navigation.state !== "idle");

  const hasNoBands = bands.length === 0;

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
                <Link to="menu" kind="primary">
                  Add band
                </Link>
              </div>
              <div>
                <Link
                  to="user"
                  isCollapsing
                  icon={faUser}
                  kind="ghost"
                  aria-label="User settings menu"
                >
                  User
                </Link>
              </div>
            </FlexList>
          </FlexHeader>
        </Navbar>
      }
      footer={
        <>
          <CreateNewButton to="menu" ariaLabel="Add bands" />
          <MobileModal
            open={subRoutes.some((route) => pathname.includes(route))}
            onClose={() => navigate(".")}
          >
            <Outlet />
          </MobileModal>
        </>
      }
    >
      {hasNoBands ? (
        <FlexList pad={4}>
          <FontAwesomeIcon icon={faBoxOpen} size="5x" />
          <p className="text-center">
            You don't have any bands added to this account.
          </p>
          <Link to="new">Create new band</Link>
          <Link to="existing">Add with code</Link>
        </FlexList>
      ) : (
        <MaxWidth>
          <div className="grid sm:grid-cols-2 gap-2 sm:gap-4 p-4">
            {bands.map((band) => (
              <NavLink
                to={`/${band.id}/setlists`}
                key={band.id}
                className="bg-base-100 rounded hover:bg-base-200"
              >
                <FlexList direction="row" pad={4} items="center">
                  <OgAvatar size="lg" icon={band.icon} bandName={band.name} />
                  <FlexList gap={0}>
                    <h2 className="text-2xl">{band.name}</h2>
                    <div>
                      <OgBadge>{band.members[0].role}</OgBadge>
                    </div>
                  </FlexList>
                </FlexList>
              </NavLink>
            ))}
          </div>
        </MaxWidth>
      )}
    </MaxHeightContainer>
  );
};
