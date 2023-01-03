import { faChevronLeft, faCircleXmark, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useActionData, useLoaderData, Link as RemixLink, useTransition } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import { Button, ErrorMessage, Field, FlexList, Input, ItemBox, Link, PasswordStrength } from "~/components";
import { compareToken, getUserById, updateUserPassword } from "~/models/user.server";
import invariant from "tiny-invariant";
import { deleteToken } from "~/models/token.server";
import { useState } from "react";
import { getPasswordError, passwordStrength } from "~/utils/assorted";
import { decrypt } from "~/utils/encryption.server";

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

  const isMatchingToken = await compareToken(decrypt(token), id)

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
  const password = formData.get('password')
  const verifyPassword = formData.get('verifyPassword')

  if (typeof password !== 'string' || typeof verifyPassword !== 'string') {
    throw new Response('passwords are not strings')
  }

  const { tests } = passwordStrength(password)

  const passwordError = getPasswordError(tests)
  if (passwordError) {
    return json({
      errors: { password: passwordError, verifyPassword: null }
    })
  }
  if (password !== verifyPassword) {
    return json({
      errors: { password: null, verifyPassword: 'passwords must match' }
    })
  }

  await updateUserPassword(user.id, password)
  await deleteToken(user.id)
  return redirect('/login')
}

export default function ResetPassword() {
  const { email } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const transition = useTransition()
  const [password, setPassword] = useState('')
  const { tests, strength } = passwordStrength(password)

  const isValid = Object.values(tests).every(test => test)
  const isLoading = transition.state !== 'idle'

  return (
    <div className="max-w-lg m-auto mt-8">
      <FlexList pad={4}>
        <FontAwesomeIcon icon={faKey} size="5x" />
        <h1 className="text-center text-2xl font-bold">Set new password for {email}</h1>
        <ItemBox>
          <Form method="put">
            <FlexList>
              <Field name="password" label="Password">
                <Input name="password" type="password" placeholder="Update password" onChange={e => setPassword(e.target.value)} />
                {actionData?.errors.password ? <ErrorMessage message={actionData?.errors.password} /> : null}
              </Field>
              <PasswordStrength tests={tests} strength={strength} />
              <Field name="verifyPassword" label="Verify password">
                <Input name="verifyPassword" type="password" placeholder="Verify password" />
                {actionData?.errors?.verifyPassword ? <ErrorMessage message="Passwords must match" /> : null}
              </Field>
              <Button kind="primary" type="submit" isDisabled={!isValid} isSaving={isLoading}>Reset password</Button>
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