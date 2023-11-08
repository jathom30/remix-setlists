import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { MainSidebar, MaxHeightContainer } from "~/components";
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
  let sideMenuPref = 'open'
  if (cookie && typeof cookie === 'object' && 'sideMenu' in cookie) {
    sideMenuPref = cookie.sideMenu.toString()
  }

  // used in useMemberRole hook in child routes
  return json({ band, memberRole, bands, sideMenuPref });
}

export default function BandRoute() {
  const { memberRole, band, bands, sideMenuPref } = useLoaderData<typeof loader>();

  return (
    <MaxHeightContainer
      footer={<div id="menu-portal" aria-hidden />}
      fullHeight
    >
      <div className="h-full sm:flex">
        <div className="hidden sm:block sm:h-full">
          <MainSidebar band={band} memberRole={memberRole} bands={bands} openState={sideMenuPref} />
        </div>

        <div className="h-full sm:hidden">
          <Outlet />
        </div>
        <div className="hidden sm:block sm:w-full sm:overflow-auto">
          <Outlet />
        </div>
      </div>
    </MaxHeightContainer>
  );
}
