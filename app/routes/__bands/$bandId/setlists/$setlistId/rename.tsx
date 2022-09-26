import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect, json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { FlexList, Input, Label, SaveButtons } from "~/components";
import { requireUserId } from "~/session.server";
import { Form, useActionData, useLoaderData, useParams } from "@remix-run/react";
import { getFields } from "~/utils/form";
import { getSetlist, updateSetlist } from "~/models/setlist.server";
import { ErrorMessage } from "~/components/ErrorMessage";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { setlistId } = params
  invariant(setlistId, 'setlistId not found')

  const setlist = await getSetlist(setlistId)
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }

  return json({ setlist })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { bandId, setlistId } = params
  const formData = await request.formData()

  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')

  const { fields, errors } = getFields<{ name: string }>(formData, [{
    name: 'name', type: 'string', isRequired: true
  }])

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 })
  }

  await updateSetlist(setlistId, fields)
  return redirect(`/${bandId}/setlists/${setlistId}`)
}

export default function RenameSetlist() {
  const { bandId, setlistId } = useParams()
  const { setlist } = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  return (
    <Form method="put">
      <FlexList>
        <FlexList gap={2} pad={4}>
          <Label required>Setlist name</Label>
          <Input name="name" defaultValue={setlist.name} />
          {data?.errors.name ? <ErrorMessage message="A setlist name is required" /> : null}
        </FlexList>
        <SaveButtons saveLabel="Update name" cancelTo={`/${bandId}/setlists/${setlistId}`} />
      </FlexList>
    </Form>
  )
}