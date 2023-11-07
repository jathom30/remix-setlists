import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { MainSidebar, MaxHeightContainer } from "~/components";
import { requireUserId } from "~/session.server";
import { Outlet, useLoaderData } from "@remix-run/react";

import { getMemberRole } from "~/models/usersInBands.server";
import invariant from "tiny-invariant";
import { getBandHome, getBands } from "~/models/band.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const [band, memberRole, bands] = await Promise.all([
    getBandHome(bandId),
    getMemberRole(bandId, userId),
    getBands(userId),
  ]);
  // used in useMemberRole hook in child routes
  return json({ band, memberRole, bands });
}

export default function BandRoute() {
  const { memberRole, band, bands } = useLoaderData<typeof loader>();

  return (
    <MaxHeightContainer
      footer={<div id="menu-portal" aria-hidden />}
      fullHeight
    >
      <div className="h-full sm:flex">
        <div className="hidden sm:block sm:h-full">
          <MainSidebar band={band} memberRole={memberRole} bands={bands} />
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
