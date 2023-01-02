import { Form, useActionData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ErrorMessage, Field, FlexList, Input, SaveButtons } from "~/components";
import { requireNonSubMember } from "~/session.server";
import { createFeel } from "~/models/feel.server";

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const name = formData.get('name')

  if (typeof name !== 'string' || name.length < 3) {
    return json({
      errors: { name: 'Feels must be at least 3 characters long' }
    })
  }

  await createFeel(name, bandId)
  return redirect(`/${bandId}/band`)
}

export default function NewFeel() {
  const actionData = useActionData<typeof action>()
  return (
    <Form method="post">
      <FlexList pad={4}>
        <FlexList gap={2}>
          <span>Create a new feel</span>
          <span className="text-sm text-text-subdued">Feels can be added to songs. They are a useful way to help categorize your songs.</span>
        </FlexList>
        <Field name="name" label="Name">
          <Input name="name" placeholder="Feel name" />
          {actionData?.errors.name ? <ErrorMessage message={actionData.errors.name} /> : null}
        </Field>
      </FlexList>
      <SaveButtons saveLabel="Create feel" cancelTo=".." />
    </Form>
  )
}