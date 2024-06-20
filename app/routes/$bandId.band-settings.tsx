import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Outlet, useLocation, useMatches } from "@remix-run/react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MaxWidth } from "~/components";

const BandSchema = z.object({
  data: z.object({
    band: z.object({
      name: z.string(),
    }),
  }),
});

const getBandMatch = (matches: ReturnType<typeof useMatches>) => {
  const bandMatch = matches.find((match) => {
    const safeParse = BandSchema.safeParse(match);
    return safeParse.success;
  });
  if (!bandMatch) {
    return null;
  }
  return BandSchema.parse(bandMatch);
};

export default function BandSettings() {
  const { bandId } = useParams();
  const { pathname } = useLocation();
  const matches = useMatches();

  const bandMatch = getBandMatch(matches);
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
              <Link to={`/${bandId}`}>
                {bandMatch?.data.band.name || "Current band"}
              </Link>
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
