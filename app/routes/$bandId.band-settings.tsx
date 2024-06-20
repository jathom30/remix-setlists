import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet, useLocation } from "@remix-run/react";
import { Link, useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MaxWidth } from "~/components";

export default function BandSettings() {
  const { bandId } = useParams();
  const { pathname } = useLocation();

  const isEditRoute = pathname.includes("edit");
  return (
    <MaxWidth>
      <Breadcrumb className="p-2 pb-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/home">Bands</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <FontAwesomeIcon icon={faChevronRight} />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/${bandId}`}>Band</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <FontAwesomeIcon icon={faChevronRight} />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/${bandId}/band-settings`}>Band Settings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {isEditRoute ? (
            <>
              <BreadcrumbSeparator>
                <FontAwesomeIcon icon={faChevronRight} />
              </BreadcrumbSeparator>

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/${bandId}/band-settings/edit`}>Edit Details</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
      <Outlet />
    </MaxWidth>
  );
}
