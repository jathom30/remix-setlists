import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { redirect } from "@remix-run/node"
import { CatchContainer, ErrorContainer, FlexList, Label, RadioGroup } from "~/components";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const formData = await request.formData()

  const requestUrl = (new URL(request.url)).searchParams

  const sort = formData.get('sort')

  const searchParams = new URLSearchParams(requestUrl)

  if (typeof sort !== 'string') {
    return redirect(`/${bandId}/setlists?${searchParams.toString()}`)
  }

  searchParams.delete('sort')
  searchParams.append('sort', sort)

  return redirect(`/${bandId}/setlists?${searchParams.toString()}`)
}

export default function SetlistsSortBy() {
  const [params] = useSearchParams()
  const submit = useSubmit()
  return (
    <Form method="put" onChange={e => submit(e.currentTarget)}>
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
      </FlexList>
    </Form>
  )
}

const sortOptions = [
  { label: 'Name: A-Z', value: 'name:asc' },
  { label: 'Name: Z-A', value: 'name:desc' },
  { label: 'Updated: newest first', value: 'updatedAt:desc' },
  { label: 'Updated: oldest first', value: 'updatedAt:asc' },
  { label: 'Created: newest first', value: 'createdAt:desc' },
  { label: 'Created: oldest first', value: 'createdAt:asc' },
]

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}