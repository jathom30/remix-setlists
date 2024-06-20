import { Outlet } from "@remix-run/react";
import { Link, useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { MaxWidth } from "~/components";

export default function BandSettings() {
  const { bandId } = useParams();
  return (
    <MaxWidth>
      <Breadcrumb className="p-2 pb-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/${bandId}/band-settings`}>Band Settings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Outlet />
    </MaxWidth>
  );
}
