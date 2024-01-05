import { faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { FlexList, Link } from "~/components";
import { getUserBands } from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const bandIds = await getUserBands(userId);
  return json({ bandIds });
}

export default function User() {
  const { bandIds } = useLoaderData<typeof loader>();
  return (
    <FlexList pad={4}>
      {bandIds.length > 0 ? (
        <Link to={`/${bandIds[0].bandId}/user`} isOutline icon={faUser}>
          User
        </Link>
      ) : null}
      <Link to="/logout" icon={faSignOut}>
        Sign Out
      </Link>
    </FlexList>
  );
}
