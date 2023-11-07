import { faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import { Form, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Button, FlexList, Link, TextOverflow } from "~/components";
import { getUserBands } from "~/models/usersInBands.server";
import { requireUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const bands = await getUserBands(user.id);
  if (!bands.length) {
    return json({ user, bandId: null });
  }
  return json({ user, bandId: bands[0].bandId });
}

export default function User() {
  const { user, bandId } = useLoaderData<typeof loader>();
  return (
    <FlexList pad={4}>
      <div className="flex flex-col items-baseline">
        <TextOverflow>{user.name}</TextOverflow>
        <TextOverflow>
          <span className="text-sm text-slate-400">{user.email}</span>
        </TextOverflow>
      </div>
      {bandId ? (
        <Link to={`/${bandId}/user`} icon={faUser} kind="secondary">
          User settings
        </Link>
      ) : null}
      <Form method="post" action="/logout">
        <FlexList>
          <Button type="submit" icon={faSignOut}>
            Sign out
          </Button>
        </FlexList>
      </Form>
    </FlexList>
  );
}
