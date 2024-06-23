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
import invariant from "tiny-invariant";
import { z } from "zod";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Header, MaxWidth } from "~/components";
import { MainNavSheet } from "~/components/main-nav-sheet";
import { UserAvatarMenu } from "~/components/user-avatar-menu";
import { getBandHome, getBands } from "~/models/band.server";
import { userPrefs } from "~/models/cookies.server";
import { getMemberRole } from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const [band, memberRole, bands] = await Promise.all([
    getBandHome(bandId),
    getMemberRole(bandId, userId),
    getBands(userId),
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

  // songs routes
  const isSongsRoute = isBandRoute && pathname.includes("songs");
  const songMatch = getMatch(matches, SongDetailMatchSchema);
  const isEditSongRoute =
    isSongsRoute && songMatch && songMatch.pathname.includes("edit");
  const isCreateSongRoute = isSongsRoute && pathname.includes("new");

  // band settings routes
  const isBandSettingsRoute = isBandRoute && pathname.includes("band-settings");
  const isEditBandSettingsRoute =
    isBandSettingsRoute && pathname.includes("edit");
  const isMembersRoute =
    isBandSettingsRoute && memberId && pathname.includes("members");

  return (
    <div className="bg-muted/40 h-full">
      <div className="p-2 border-b sticky top-0 inset-x-0 z-10 bg-background">
        <Header>
          <div className="sm:hidden">
            <MainNavSheet
              band={bandMatch?.data?.band}
              role={bandMatch?.data?.memberRole}
            />
          </div>
          <UserAvatarMenu />
        </Header>
      </div>
      <MaxWidth>
        <Breadcrumb className="p-2 pb-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/home">Bands</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {isBandRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}`}>
                      {bandMatch?.data.band.name || "Dashboard"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isSetlistsRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists`}>Setlists</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {isSetlistDetailRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists/${setlistId}`}>
                      {setlistMatch.data.setlist.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {isCondensedSetlistRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists/${setlistId}/condensed`}>
                      Condensed
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {isCreateSetlistsRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists/new`}>Create</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isManualCreateSetlistRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists/new`}>Create</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists/manual`}>Manual</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {isAutoCreateSetlistRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists/new`}>Create</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/setlists/auto`}>Auto</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isSongsRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/songs`}>Songs</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {songMatch ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/songs/${songMatch.data.song.id}`}>
                      {songMatch.data.song.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isEditSongRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={`/${bandId}/songs/${songMatch.data.song.id}/edit`}
                    >
                      Edit
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isCreateSongRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/songs/new`}>Create</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isBandSettingsRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/band-settings`}>Settings</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isEditBandSettingsRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/band-settings/edit`}>
                      Edit Details
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}

            {isMembersRoute ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${bandId}/band-settings/members/${memberId}`}>
                      Member Role
                    </Link>
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
}
