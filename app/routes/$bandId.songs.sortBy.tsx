import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useParams,
  useRouteError,
  useSearchParams,
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
import { sortOptions } from "~/utils/params";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const sort = String(cookie.songSort) || "name:asc";

  return json({ sort });
}

export default function SongsSortBy() {
  const { sort } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [params] = useSearchParams();
  const { bandId } = useParams();
  const submit = useSubmit();
  return (
    <fetcher.Form
      method="put"
      action={`/resource/songSortBy?${params}`}
      onChange={(e) => submit(e.currentTarget)}
    >
      <FlexList pad={4}>
        <Label>Sort by</Label>
        <RadioGroup
          name="sort"
          direction="col"
          gap={0}
          options={sortOptions}
          isChecked={(val) => val === (sort ?? "name:asc")}
        />
        <input
          hidden
          type="hidden"
          name="redirectTo"
          value={`/${bandId}/songs`}
        />
      </FlexList>
    </fetcher.Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
