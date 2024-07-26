import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLocation,
  useMatches,
  useParams,
} from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlexList, Header, MaxWidth } from "~/components";
import { MainNav } from "~/components/main-nav";
import { MainNavSheet } from "~/components/main-nav-sheet";
import { UserAvatarMenu } from "~/components/user-avatar-menu";
import { getBandHome, getBands } from "~/models/band.server";
import { userPrefs } from "~/models/cookies.server";
import { getMemberRole } from "~/models/usersInBands.server";
import { requireUser } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const [band, memberRole, bands] = await Promise.all([
    getBandHome(bandId),
    getMemberRole(bandId, user.id),
    getBands(user.id),
  ]);

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  // default to open if cookie is not yet set
  let sideMenuPref = "open";
  if (cookie && typeof cookie === "object" && "sideMenu" in cookie) {
    sideMenuPref = cookie.sideMenu.toString();
  }

  // used in useMemberRole hook in child routes
  return json({ band, memberRole, bands, sideMenuPref });
}

const BandSchema = z.object({
  data: z.object({
    band: z.object({
      name: z.string(),
      icon: z.object({
        path: z.string().nullable(),
      }),
    }),
    memberRole: z.string(),
  }),
});

export type TBandSchema = z.infer<typeof BandSchema>;

const SongDetailMatchSchema = z.object({
  data: z.object({
    song: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
  pathname: z.string(),
});

const SetlistDetailMatchSchema = z.object({
  data: z.object({
    setlist: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
  pathname: z.string(),
});

const FeelMatchSchema = z.object({
  data: z.object({
    feel: z.object({
      id: z.string(),
      label: z.string(),
      color: z.string().nullable(),
    }),
  }),
});

const getMatch = <Z extends z.ZodTypeAny>(
  matches: ReturnType<typeof useMatches>,
  schema: Z,
) => {
  const match = matches.find((match) => {
    const safeParse = schema.safeParse(match);
    return safeParse.success;
  });
  if (!match) {
    return null;
  }
  return schema.parse(match);
};

export default function BandRoute() {
  const { bandId, memberId, setlistId } = useParams();
  const { pathname } = useLocation();
  const matches = useMatches();
  const bandMatch = getMatch(matches, BandSchema);

  // base routes
  const isBandRoute = Boolean(bandId);

  // setlist routes
  const isSetlistsRoute = isBandRoute && pathname.includes("setlists");
  const isCreateSetlistsRoute = isSetlistsRoute && pathname.includes("new");
  const isManualCreateSetlistRoute =
    isSetlistsRoute && pathname.includes("manual");
  const isAutoCreateSetlistRoute = isSetlistsRoute && pathname.includes("auto");
  const setlistMatch = getMatch(matches, SetlistDetailMatchSchema);
  const isSetlistDetailRoute = isSetlistsRoute && Boolean(setlistId);
  const isCondensedSetlistRoute =
    isSetlistDetailRoute && pathname.includes("condensed");
  const isSetlistMetricsRoute =
    isSetlistDetailRoute && pathname.includes("metrics");
  const isSetlistNotesRoute =
    isSetlistDetailRoute && pathname.includes("notes");

  // songs routes
  const isSongsRoute = isBandRoute && pathname.includes("songs");
  const songMatch = getMatch(matches, SongDetailMatchSchema);
  const isEditSongRoute =
    isSongsRoute && songMatch && songMatch.pathname.includes("edit");
  const isCreateSongRoute = isSongsRoute && pathname.includes("new");

  // feels routes
  const isFeelsRoute = isBandRoute && pathname.includes("feels");
  const feelMatch = getMatch(matches, FeelMatchSchema);
  const isEditFeelRoute =
    isFeelsRoute && feelMatch && pathname.includes("edit");
  const isNewFeelRoute = isFeelsRoute && pathname.includes("new");

  // band settings routes
  const isBandSettingsRoute = isBandRoute && pathname.includes("band-settings");
  const isEditBandSettingsRoute =
    isBandSettingsRoute && pathname.includes("edit");
  const isMembersRoute =
    isBandSettingsRoute && memberId && pathname.includes("members");

  const crumbs: { label: string; to: string }[] = [
    { to: "/home", label: "Bands" },
    ...(isBandRoute
      ? [{ to: `/${bandId}`, label: bandMatch?.data.band.name || "Dashboard" }]
      : []),
    ...(isSetlistsRoute
      ? [{ to: `/${bandId}/setlists`, label: "Setlists" }]
      : []),
    ...(isSetlistDetailRoute
      ? [
          {
            to: `/${bandId}/setlists/${setlistId}`,
            label: setlistMatch?.data.setlist.name,
          },
        ]
      : []),
    ...(isCondensedSetlistRoute
      ? [
          {
            to: `/${bandId}/setlists/${setlistId}/condensed`,
            label: "Condensed",
          },
        ]
      : []),
    ...(isSetlistMetricsRoute
      ? [{ to: `/${bandId}/setlists/${setlistId}/metrics`, label: "Metrics" }]
      : []),
    ...(isSetlistNotesRoute
      ? [{ to: `/${bandId}/setlists/${setlistId}/notes`, label: "Notes" }]
      : []),
    ...(isCreateSetlistsRoute
      ? [{ to: `/${bandId}/setlists/new`, label: "Create" }]
      : []),
    ...(isManualCreateSetlistRoute
      ? [
          { to: `/${bandId}/setlists/new`, label: "Create" },
          { to: `/${bandId}/setlists/manual`, label: "Manual" },
        ]
      : []),
    ...(isAutoCreateSetlistRoute
      ? [
          { to: `/${bandId}/setlists/new`, label: "Create" },
          { to: `/${bandId}/setlists/auto`, label: "Auto" },
        ]
      : []),
    ...(isSongsRoute ? [{ to: `/${bandId}/songs`, label: "Songs" }] : []),
    ...(songMatch
      ? [
          {
            to: `/${bandId}/songs/${songMatch.data.song.id}`,
            label: songMatch?.data.song.name,
          },
        ]
      : []),
    ...(isEditSongRoute
      ? [
          {
            to: `/${bandId}/songs/${songMatch.data.song.id}/edit`,
            label: "Edit",
          },
        ]
      : []),
    ...(isCreateSongRoute
      ? [{ to: `/${bandId}/songs/new`, label: "Create" }]
      : []),
    ...(isFeelsRoute ? [{ to: `/${bandId}/feels`, label: "Feels" }] : []),
    ...(feelMatch
      ? [
          {
            to: `/${bandId}/feels/${feelMatch.data.feel.id}`,
            label: feelMatch?.data.feel.label,
          },
        ]
      : []),
    ...(isEditFeelRoute
      ? [
          {
            to: `/${bandId}/feels/${feelMatch?.data.feel.id}/edit`,
            label: "Edit",
          },
        ]
      : []),
    ...(isNewFeelRoute ? [{ to: `/${bandId}/feels/new`, label: "New" }] : []),
    ...(isBandSettingsRoute
      ? [{ to: `/${bandId}/band-settings`, label: "Settings" }]
      : []),
    ...(isEditBandSettingsRoute
      ? [{ to: `/${bandId}/band-settings/edit`, label: "Edit" }]
      : []),
    ...(isMembersRoute
      ? [
          {
            to: `/${bandId}/band-settings/members/${memberId}`,
            label: "Members",
          },
        ]
      : []),
  ];

  return (
    <div className="h-full">
      <div className="p-2 border-b sticky top-0 inset-x-0 z-10 bg-background">
        <MaxWidth>
          <Header>
            <div>
              <div className="md:hidden">
                <MainNavSheet
                  band={bandMatch?.data?.band}
                  role={bandMatch?.data?.memberRole}
                />
              </div>
              <div className="hidden md:block">
                <MainNav />
              </div>
            </div>
            <FlexList direction="row" gap={2} items="center">
              <div className="hidden md:block">
                <Badge variant="secondary">{bandMatch?.data?.memberRole}</Badge>
              </div>
              <UserAvatarMenu />
            </FlexList>
          </Header>
        </MaxWidth>
      </div>
      <MaxWidth>
        <Breadcrumb className="p-2 pb-0">
          <DesktopBreadcrumbsList initialCrumbs={crumbs} />
          <MobileBreadcrumbsList initialCrumbs={crumbs} />
        </Breadcrumb>
        <Outlet />
      </MaxWidth>
    </div>
  );
}

const MobileBreadcrumbsList = ({
  initialCrumbs,
}: {
  initialCrumbs: { label: string; to: string }[];
}) => {
  const getCrumbs = () => {
    if (initialCrumbs.length > 3) {
      const crumbsLength = initialCrumbs.length;
      const first = initialCrumbs.slice(0, 1);
      const last = initialCrumbs.slice(crumbsLength - 1);
      const rest = initialCrumbs.slice(1, crumbsLength - 1);
      return {
        start: first[0],
        rest,
        end: last[0],
      };
    }
    return initialCrumbs;
  };
  const crumbs = getCrumbs();
  return (
    <BreadcrumbList className="md:hidden">
      {Array.isArray(crumbs) ? (
        crumbs.map((crumb, i) => (
          <Fragment key={crumb.to}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={crumb.to}>{crumb.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.length - 1 !== i ? (
              <BreadcrumbSeparator>
                <ChevronRight size={16} />
              </BreadcrumbSeparator>
            ) : null}
          </Fragment>
        ))
      ) : (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={crumbs.start.to}>{crumbs.start.label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <ChevronRight size={16} />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {crumbs.rest.map((crumb) => (
                  <DropdownMenuItem asChild key={crumb.to}>
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>

          <BreadcrumbSeparator>
            <ChevronRight size={16} />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={crumbs.end.to}>{crumbs.end.label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
    </BreadcrumbList>
  );
};

const DesktopBreadcrumbsList = ({
  initialCrumbs,
}: {
  initialCrumbs: { label: string; to: string }[];
}) => {
  return (
    <BreadcrumbList className="hidden md:flex">
      {initialCrumbs.map((crumb, i) => (
        <Fragment key={crumb.to}>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={crumb.to}>{crumb.label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {initialCrumbs.length - 1 !== i ? (
            <BreadcrumbSeparator>
              <ChevronRight size={16} />
            </BreadcrumbSeparator>
          ) : null}
        </Fragment>
      ))}
    </BreadcrumbList>
  );
};
