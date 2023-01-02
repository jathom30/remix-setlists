import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import { ErrorMessage, Field, FlexList, Input, SaveButtons } from "~/components";
import { getFeel, updateFeel } from "~/models/feel.server";
import { requireNonSubMember } from "~/session.server";
import invariant from "tiny-invariant";

export async function loader({ request, params }: LoaderArgs) {
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

export async function action({ request, params }: ActionArgs) {
  const { bandId, feelId } = params
  invariant(bandId, 'bandId not found')
  invariant(feelId, 'feelId not found')
  await requireNonSubMember(request, bandId)
  const formData = await request.formData()
  const name = formData.get('name')

  if (typeof name !== 'string' || name.length < 3) {
    return json({
      errors: { name: 'Name must be at least 3 characters long' }
    })
  }
  await updateFeel(feelId, { label: name })
  return redirect(`/${bandId}/band`)
}

export default function EditFeel() {
  const { feel } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <Form method="put">
      <FlexList pad={4}>
        <span className="font-bold">Edit feel</span>
        <Field name="name" label="Name">
          <Input name="name" defaultValue={feel.label} placeholder={feel.label} />
          {actionData?.errors.name ? <ErrorMessage message={actionData.errors.name} /> : null}
        </Field>
      </FlexList>
      <SaveButtons saveLabel="Update feel" cancelTo=".." />
    </Form>
  )
}