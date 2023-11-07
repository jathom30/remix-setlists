import { Form, isRouteErrorResponse, useActionData, useRouteError } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { CatchContainer, ErrorContainer, ErrorMessage, Field, FlexList, Input, SaveButtons } from "~/components";
import { requireNonSubMember } from "~/session.server";
import { createFeel } from "~/models/feel.server";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  return null
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const name = formData.get('name')
  const color = formData.get('color')

  if (typeof name !== 'string' || name.length < 3) {
    return json({
      errors: { name: 'Feels must be at least 3 characters long' }
    })
  }
  if (typeof color !== 'string') {
    return json({
      errors: { name: null, color: 'Color must be a string' }
    })
  }

  await createFeel(name, bandId, color)
  return redirect(`/${bandId}/band`)
}

export default function NewFeel() {
  const actionData = useActionData<typeof action>()
  const [color, setColor] = useState('#000');

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
        <FlexList items="center">
          <HexColorPicker color={color} onChange={setColor} />
        </FlexList>
      </FlexList>
      <input hidden type="hidden" name="color" defaultValue={color} />
      <SaveButtons saveLabel="Create feel" cancelTo=".." />
    </Form>
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