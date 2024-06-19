import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Header } from "~/components";
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

export default function BandRoute() {
  return (
    <div className="bg-muted/40 h-full">
      <div className="p-2 border-b sticky top-0 inset-x-0 z-10 bg-background">
        <Header>
          <div className="sm:hidden">
            <MainNavSheet />
          </div>
          <UserAvatarMenu />
        </Header>
      </div>
      <Outlet />
    </div>
  );
}
