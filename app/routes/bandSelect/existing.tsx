import { Form, useActionData, useCatch } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { ErrorContainer, ErrorMessage, FlexList, Input, Label, Link, SaveButtons } from "~/components";
import { requireUserId } from "~/session.server";
import { getFields } from "~/utils/form";
import { updateBandByCode } from "~/models/band.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const { fields, errors } = getFields<{ bandCode: string }>(formData, [
    { name: 'bandCode', type: 'string', isRequired: true }
  ])

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 })
  }

  await updateBandByCode(fields.bandCode, userId)
  return redirect('.')
}

export default function ExisitingBand() {
  const actionData = useActionData<typeof action>()

  return (
    <Form method="put">
      <FlexList gap={0} pad={4}>
        <Label>Band Code</Label>
        <Input name="bandCode" placeholder="Enter your band code here..." />
        {actionData?.errors.bandCode ? <ErrorMessage message={actionData.errors.bandCode} /> : null}
      </FlexList>
      <SaveButtons
        saveLabel="Add me to this band"
        cancelTo="/bandSelect"
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}
