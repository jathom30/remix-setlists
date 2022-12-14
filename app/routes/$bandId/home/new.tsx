import type { ActionArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { redirect } from "@remix-run/node";
import { createBand } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { Form, useActionData } from "@remix-run/react";
import { ErrorMessage, FlexList, Input, SaveButtons } from "~/components";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const name = formData.get('name')

  const hasName = name && typeof name === 'string'

  if (hasName) {
    const band = await createBand({ name }, userId)
    return redirect(`/${band.id}/setlists`)
  }
  return json({ errors: { name: 'Band name is required' } })
}

export default function NewBand() {
  const actionData = useActionData<typeof action>()

  return (
    <Form method="post">
      <FlexList pad={4} gap={0}>
        <h1>Create a new band</h1>
        <Input name="name" placeholder="Band name..." />
        {actionData?.errors.name ? <ErrorMessage message="Band name is required" /> : null}
      </FlexList>
      <SaveButtons saveLabel="Create" cancelTo=".." />
    </Form>
  )
}