import {
  faAdd,
  faBoxOpen,
  faChevronRight,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
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
import { Boxes } from "lucide-react";
import { useSpinDelay } from "spin-delay";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
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
import { UserAvatarMenu } from "~/components/user-avatar-menu";
import { getBands } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { useFeatureFlags } from "~/utils";

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
  const { pathname } = useLocation();
  const isAddBandRoute = pathname.includes("add-band");
  const isNewBandRoute = isAddBandRoute && pathname.includes("new");
  const isExistingBandRoute = isAddBandRoute && pathname.includes("existing");
  return (
    <div className="bg-muted/40 h-full">
      <div className="sticky border-b top-0 z-10 bg-background inset-x-0 flex items-center justify-between p-2 gap-2">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/home">
            <FlexList direction="row" gap={2}>
              <Boxes className="w-4 h-4" />
              Bands
            </FlexList>
          </Link>
        </Button>
        <FlexList direction="row" items="center" gap={2}>
          {!pathname.includes("add-band") ? (
            <Button size="sm" asChild>
              <Link to="add-band">
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
                Add Band
              </Link>
            </Button>
          ) : null}
          <UserAvatarMenu />
        </FlexList>
      </div>
      <MaxWidth>
        <Breadcrumb className="p-2 pb-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/home">Bands</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {isAddBandRoute ? (
              <>
                <BreadcrumbSeparator>
                  <FontAwesomeIcon icon={faChevronRight} />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/home/add-band">Add Band</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {isNewBandRoute ? (
              <>
                <BreadcrumbSeparator>
                  <FontAwesomeIcon icon={faChevronRight} />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/home/add-band/new">New</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {isExistingBandRoute ? (
              <>
                <BreadcrumbSeparator>
                  <FontAwesomeIcon icon={faChevronRight} />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/home/add-band/existing">Join</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
          </BreadcrumbList>
        </Breadcrumb>
        <Outlet />
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
