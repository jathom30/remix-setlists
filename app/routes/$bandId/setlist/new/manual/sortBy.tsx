import { useFetcher, useParams, useSearchParams, useSubmit } from "@remix-run/react";
import { CatchContainer, ErrorContainer, FlexList, Label, RadioGroup } from "~/components";
import { sortOptions } from "~/utils/params";

export default function SongsSortBy() {
  const fetcher = useFetcher()
  const [params] = useSearchParams()
  const { bandId } = useParams()
  const submit = useSubmit()
  return (
    <fetcher.Form method="put" action={`/resource/songSortBy?${params}`} onChange={e => submit(e.currentTarget)}>
      <FlexList pad="md">
        <Label>Sort by</Label>
        <RadioGroup
          name="sort"
          direction="col"
          gap="none"
          options={sortOptions}
          isChecked={(val) => {
            const sort = params.get('sort')
            return val === (sort ?? 'name:asc')
          }}
        />
        <input hidden type="hidden" name="redirectTo" value={`/${bandId}/setlist/new/manual`} />
      </FlexList>
    </fetcher.Form>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}