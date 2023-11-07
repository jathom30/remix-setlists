import { Form, isRouteErrorResponse, useActionData, useLoaderData, useRouteError } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { HexColorPicker } from "react-colorful"
import { json, redirect } from "@remix-run/node";
import { CatchContainer, ErrorContainer, ErrorMessage, Field, FlexList, Input, SaveButtons } from "~/components";
import { getFeel, updateFeel } from "~/models/feel.server";
import { requireNonSubMember } from "~/session.server";
import invariant from "tiny-invariant";
import { useState } from "react";
import { contrastColor } from "~/utils/assorted";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId, feelId } = params
  invariant(bandId, 'bandId not found')
  invariant(feelId, 'feelId not found')
  await requireNonSubMember(request, bandId)
  const feel = await getFeel(feelId)
  if (!feel) {
    throw new Response("Feel not found", { status: 404 })
  }
  return json({ feel })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId, feelId } = params
  invariant(bandId, 'bandId not found')
  invariant(feelId, 'feelId not found')
  await requireNonSubMember(request, bandId)
  const formData = await request.formData()
  const name = formData.get('name')
  const color = formData.get('color')

  if (typeof name !== 'string' || name.length < 3) {
    return json({
      errors: { name: 'Name must be at least 3 characters long', color: null }
    })
  }
  if (typeof color !== 'string') {
    return json({
      errors: { name: null, color: 'Color must be a string' }
    })
  }
  await updateFeel(feelId, { label: name, color })
  return redirect(`/${bandId}/band`)
}

export default function EditFeel() {
  const { feel } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [color, setColor] = useState(feel.color || '');

  return (
    <Form method="put">
      <FlexList pad={4}>
        <span className="font-bold">Edit {feel.label}</span>
        <Field name="name" label="Name">
          <Input name="name" defaultValue={feel.label} placeholder={feel.label} />
          {actionData?.errors.name ? <ErrorMessage message={actionData.errors.name} /> : null}
        </Field>
        <div className="flex gap-4">
          <div className="flex-grow">
            <HexColorPicker color={color} onChange={setColor} />
          </div>
          <div className="w-full h-30 flex flex-col gap-1">
            <div className="font-bold h-full flex items-center justify-center rounded-t-lg" style={{ backgroundColor: feel.color || '', color: contrastColor(feel.color || '') }}>
              <span>Original  color</span>
            </div>
            <div className="font-bold h-full flex items-center justify-center rounded-b-lg" style={{ backgroundColor: color, color: contrastColor(color) }}>
              <span>New color</span>
            </div>
          </div>
        </div>
      </FlexList>
      <input hidden type="hidden" name="color" value={color} />
      <SaveButtons saveLabel="Update feel" cancelTo=".." />
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