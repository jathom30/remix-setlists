import { faChevronLeft, faCircleXmark, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useActionData, useLoaderData, Link as RemixLink } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import { Button, ErrorMessage, Field, FlexList, Input, ItemBox, Link } from "~/components";
import { getFields } from "~/utils/form";
import { compareToken, getUserById, updateUser } from "~/models/user.server";
import invariant from "tiny-invariant";
import { deleteToken } from "~/models/token.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const urlSearchParams = url.searchParams
  const token = urlSearchParams.get('token')
  const id = urlSearchParams.get('id')
  invariant(token, 'Token not found')
  invariant(id, 'User id not found')
  const user = await getUserById(id)

  if (!user) {
    return redirect('/join')
  }

  const isMatchingToken = await compareToken(token, id)

  if (!isMatchingToken) {
    throw new Response('token does not match', { status: 404 })
  }
  return json({ email: user.email })
}

export async function action({ request }: ActionArgs) {
  const url = new URL(request.url)
  const urlSearchParams = url.searchParams
  const id = urlSearchParams.get('id')
  invariant(id, 'User id not found')

  const user = await getUserById(id)
  if (!user) {
    return redirect('/join')
  }

  const formData = await request.formData()
  const { fields, errors } = getFields<{ password: string; verifyPassword: string }>(formData, [
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
  }

  await updateUser(user.id, user.name, fields.password)
  await deleteToken(user.id)
  return redirect('/login')
}

export default function ResetPassword() {
  const { email } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <div className="max-w-lg m-auto mt-8">
      <FlexList pad={4}>
        <FontAwesomeIcon icon={faKey} size="5x" />
        <h1 className="text-center text-2xl font-bold">Set new password for {email}</h1>
        <ItemBox>
          <Form method="put">
            <FlexList>
              <Field name="password" label="Password">
                <Input name="password" type="password" placeholder="Update password" />
                {actionData?.errors.password ? <ErrorMessage message={actionData?.errors.password} /> : null}
              </Field>
              <Field name="verifyPassword" label="Verify password">
                <Input name="verifyPassword" type="password" placeholder="Verify password" />
                {actionData?.errors?.verifyPassword ? <ErrorMessage message="Passwords must match" /> : null}
              </Field>
              <Button kind="primary" type="submit">Reset password</Button>
              <Link to="/login" kind="text" icon={faChevronLeft}>Back to log in</Link>
            </FlexList>
          </Form>
        </ItemBox>
      </FlexList>
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="max-w-lg m-auto mt-8">
      <FlexList pad={4}>
        <FontAwesomeIcon icon={faCircleXmark} size="5x" />
        <h1 className="text-center text-2xl font-bold">Oops...</h1>
        <ItemBox>
          <FlexList>
            <p>It looks like this link is either incorrect or too old.</p>
            <p>If you'd like to request a new email, <RemixLink className="text-blue-500 underline" to="/forgotPassword">click here</RemixLink>.</p>
          </FlexList>
        </ItemBox>
      </FlexList>
    </div>
  )
}

export function CatchBoundary() {
  return (
    <div className="max-w-lg m-auto mt-8">
      <FlexList pad={4}>
        <FontAwesomeIcon icon={faCircleXmark} size="5x" />
        <h1 className="text-center text-2xl font-bold">Oops...</h1>
        <ItemBox>
          <FlexList>
            <p>It looks like this link is either incorrect or too old.</p>
            <p>If you'd like to request a new email, <RemixLink className="text-blue-500 underline" to="/forgotPassword">click here</RemixLink>.</p>
          </FlexList>
        </ItemBox>
      </FlexList>
    </div>
  )
}