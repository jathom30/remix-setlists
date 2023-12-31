import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  useSubmit,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  CatchContainer,
  ErrorContainer,
  FlexList,
  Label,
  RadioGroup,
} from "~/components";
import { userPrefs } from "~/models/cookies.server";
import { requireUserId } from "~/session.server";

export async function loader({request, params}: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const sort = String(cookie.setlistSort) || "name:asc";

  return json({ sort });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const formData = await request.formData();

  const requestUrl = new URL(request.url).searchParams;

  const sort = formData.get("sort");

  const searchParams = new URLSearchParams(requestUrl);

  if (typeof sort !== "string") {
    return redirect(`/${bandId}/setlists?${searchParams.toString()}`);
  }

  searchParams.delete("sort");
  searchParams.append("sort", sort);

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  cookie.setlistSort = sort;


  return redirect(`/${bandId}/setlists?${searchParams.toString()}`, {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}

export default function SetlistsSortBy() {
  const { sort } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  return (
    <Form method="put" onChange={(e) => submit(e.currentTarget)}>
      <FlexList pad={4}>
        <Label>Sort by</Label>
        <RadioGroup
          name="sort"
          direction="col"
          gap={0}
          options={sortOptions}
          isChecked={(val) => val === (sort ?? "name:asc")}
        />
      </FlexList>
    </Form>
  );
}

const sortOptions = [
  { label: "Name: A-Z", value: "name:asc" },
  { label: "Name: Z-A", value: "name:desc" },
  { label: "Updated: newest first", value: "updatedAt:desc" },
  { label: "Updated: oldest first", value: "updatedAt:asc" },
  { label: "Created: newest first", value: "createdAt:desc" },
  { label: "Created: oldest first", value: "createdAt:asc" },
];

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
