import type { ActionArgs } from "@remix-run/server-runtime"
import { redirect } from "@remix-run/node";
import { createBand } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { Form } from "@remix-run/react";
import { Button, FlexList, Input } from "~/components";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const name = formData.get('name')
  const code = formData.get('code')

  const hasName = name && typeof name === 'string'
  const hasCode = code && typeof code === 'string'

  if (hasCode && hasName) {
    const band = await createBand({ name, code }, userId)
    return redirect(band.id)
  }
  return null
}

export default function NewBand() {
  return (
    <div>
      <Form method="post">
        <FlexList pad={4}>
          <h1>Create a new band</h1>
          <Input name="name" placeholder="Band name..." />
          <Input name="code" placeholder="Band code..." />
          <Button type="submit">Create</Button>
        </FlexList>
      </Form>
    </div>
  )
}