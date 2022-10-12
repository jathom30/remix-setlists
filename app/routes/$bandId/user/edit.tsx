import { Form, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { ErrorContainer, Field, FlexList, Input, SaveButtons } from "~/components";
import { requireUser, requireUserId } from "~/session.server";
import { getFields } from "~/utils/form";
import { updateUser } from "~/models/user.server";
import invariant from "tiny-invariant";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)

  return json({ user })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const { fields, errors } = getFields<{ name: string }>(formData, [{ name: 'name', type: 'string', isRequired: true }])

  if (Object.keys(errors).length) {
    return json({ errors })
  }

  await updateUser(userId, fields)
  return redirect(`/${bandId}/user`)
}

export default function EditUser() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <Form method="put">
      <FlexList pad={4}>
        <Field name="name" label="Name">
          <Input name="name" placeholder="User name" defaultValue={user.name || ''} />
        </Field>
        {/* <Field name="password" label="Password">
          <Input name="password" placeholder="Update password" />
        </Field>
        <Field name="verifyPassword" label="Verify password">
          <Input name="verifyPassword" placeholder="Verify password" />
        </Field> */}
      </FlexList>
      <SaveButtons
        saveLabel="Update user profile"
        cancelTo=".."
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}