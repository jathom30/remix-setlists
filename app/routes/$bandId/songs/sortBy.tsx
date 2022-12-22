import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { redirect } from "@remix-run/node"
import { FlexList, Label, RadioGroup } from "~/components";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const formData = await request.formData()

  const sort = formData.get('sort')

  if (typeof sort !== 'string') {
    return null
  }

  const searchParams = new URLSearchParams()
  searchParams.append('sort', sort)

  return redirect(`/${bandId}/songs?${searchParams.toString}`)
}

export default function SongsSortBy() {
  const [params] = useSearchParams()
  const submit = useSubmit()
  return (
    <Form action=".." onChange={e => submit(e.currentTarget)}>
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
  { label: 'Tempo: slow-fast', value: 'tempo:asc' },
  { label: 'Tempo: fast-slow', value: 'tempo:desc' },
]