import { isRouteErrorResponse, useFetcher, useParams, useRouteError, useSearchParams, useSubmit } from "@remix-run/react";
import { CatchContainer, ErrorContainer, FlexList, Label, RadioGroup } from "~/components";
import { sortOptions } from "~/utils/params";

export default function SongsSortBy() {
  const fetcher = useFetcher()
  const [params] = useSearchParams()
  const { bandId } = useParams()
  const submit = useSubmit()
  return (
    <fetcher.Form method="put" action={`/resource/songSortBy?${params}`} onChange={e => submit(e.currentTarget)}>
      <FlexList pad={4}>
        <Label>Sort by</Label>
        <RadioGroup
          name="sort"
          direction="col"
          gap={0}
          options={sortOptions}
          isChecked={(val) => {
            const sort = params.get('sort')
            return val === (sort ?? 'name:asc')
          }}
        />
        <input hidden type="hidden" name="redirectTo" value={`/${bandId}/songs`} />
      </FlexList>
    </fetcher.Form>
  )
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return (
      <ErrorContainer error={error as Error} />
    )
  }
  return <CatchContainer status={error.status} data={error.data} />
}