import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { Boxes, ChevronRight } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FlexList, Header, MaxWidth } from "~/components";
import { UserAvatarMenu } from "~/components/user-avatar-menu";
import { getBands } from "~/models/band.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const bands = await getBands(userId);

  if (!bands) {
    throw new Response("Bands not found", { status: 404 });
  }
  return json({ bands });
}

export default function Home() {
  const { pathname } = useLocation();
  const isAddBandRoute = pathname.includes("add-band");
  const isNewBandRoute = isAddBandRoute && pathname.includes("new");
  const isExistingBandRoute = isAddBandRoute && pathname.includes("existing");
  const isAddFromLink = pathname.includes("add-to-band");
  return (
    <div className="bg-muted/40 h-full">
      <div className="sticky border-b top-0 z-10 bg-background inset-x-0 flex items-center justify-between p-2 gap-2">
        <MaxWidth>
          <Header>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/home">
                <FlexList direction="row" gap={2}>
                  <Boxes className="w-4 h-4" />
                  Bands
                </FlexList>
              </Link>
            </Button>
            <FlexList direction="row" items="center" gap={2}>
              <UserAvatarMenu />
            </FlexList>
          </Header>
        </MaxWidth>
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
                  <ChevronRight className="w-4 h-4" />
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
                  <ChevronRight className="w-4 h-4" />
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
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/home/add-band/existing">Join</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {/* should only see this UI if there was an error joining */}
            {isAddFromLink ? (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/home/add-band/existing">Error Joining Band</Link>
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
