import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import {
  Avatar,
  CatchContainer,
  ErrorContainer,
  FlexList,
  Link,
} from "~/components";
import { requireAdminMember } from "~/session.server";
import { useBandIcon } from "~/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  return await requireAdminMember(request, bandId);
}

export default function AvatarBase() {
  const data = useBandIcon();
  return (
    <FlexList pad={4} items="center">
      <Avatar bandName={data?.bandName || ""} icon={data?.icon} size="xl" />
      <FlexList direction="row">
        <Link icon={faPencil} to="edit">
          Change
        </Link>
        {data?.icon.path ? (
          <Link kind="error" icon={faTrash} to="delete">
            Remove
          </Link>
        ) : null}
      </FlexList>
    </FlexList>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
