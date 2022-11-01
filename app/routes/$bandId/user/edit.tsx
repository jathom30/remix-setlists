import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { ErrorContainer, ErrorMessage, Field, FlexList, Input, SaveButtons } from "~/components";
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
  const { fields, errors } = getFields<{ name: string; password: string; verifyPassword: string }>(formData, [
    { name: 'name', type: 'string', isRequired: true },
    { name: 'password', type: 'string', isRequired: true },
    { name: 'verifyPassword', type: 'string', isRequired: true },
  ])

  const passwordsDoNotMatch = fields.password !== fields.verifyPassword
  const passwordTooShort = fields.password.length < 8
  const passwordErrors = {
    ...(passwordsDoNotMatch ? { verifyPassword: 'Passwords must match' } : {}),
    ...(passwordTooShort ? { password: 'Password is too short' } : {})
  }

  if (Object.keys(passwordErrors).length) {
    return json({ errors: passwordErrors })
  }

  if (Object.keys(errors).length) {
    return json({ errors })
  } else {
    await updateUser(userId, fields.name, fields.password)
    return redirect(`/${bandId}/user`)
  }
}

export default function EditUser() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <Form method="put">
      <FlexList pad={4}>
        <Field name="name" label="Name">
          <Input name="name" placeholder="User name" defaultValue={user.name || ''} />
        </Field>
        <Field name="password" label="Password">
          <Input name="password" type="password" placeholder="Update password" />
          {actionData?.errors.password ? <ErrorMessage message={actionData?.errors.password} /> : null}
        </Field>
        <Field name="verifyPassword" label="Verify password">
          <Input name="verifyPassword" type="password" placeholder="Verify password" />
          {actionData?.errors?.verifyPassword ? <ErrorMessage message="Passwords must match" /> : null}
        </Field>
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