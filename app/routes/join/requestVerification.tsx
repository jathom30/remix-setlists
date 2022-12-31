import { faChevronLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { Button, ErrorMessage, Field, FlexList, Input, ItemBox, Link } from "~/components";
import { validateEmail } from "~/utils";
import { generateTokenLink, getUserByEmail } from "~/models/user.server";
import { verifyAccount } from "~/email/verify";

export async function loader({ request }: LoaderArgs) {
  const urlSearchParams = (new URL(request.url)).searchParams
  const email = urlSearchParams.get('email')

  return json({ email })
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')

  if (!validateEmail(email)) {
    return json({
      errors: {
        email: 'invalid email address'
      }
    })
  }

  const user = await getUserByEmail(email)
  if (!user) {
    return json({
      errors: {
        email: 'User does not exist with this email'
      }
    })
  }

  // send email
  const magicLink = await generateTokenLink(email, 'join/verify');
  verifyAccount(email, magicLink)
  return redirect('/join/verificationSent')
}

export default function RequestVerification() {
  const { email } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <FlexList pad={4}>
      <FontAwesomeIcon icon={faEnvelope} size="5x" />
      <h1 className="text-center text-2xl font-bold">Request a verification email</h1>
      <p className="text-sm text-slate-500 text-center">It looks like this email is not yet verified with us</p>
      <ItemBox>
        <Form method="put">
          <FlexList>
            <Field name="email" label="Email">
              <Input name="email" type="email" placeholder="Account email" defaultValue={email || ''} />
              {actionData?.errors.email ? <ErrorMessage message={actionData?.errors.email} /> : null}
            </Field>

            <Button kind="primary" type="submit">Send email</Button>
            <Link to="/login" kind="text" icon={faChevronLeft}>Back to log in</Link>
          </FlexList>
        </Form>
      </ItemBox>
    </FlexList>
  )
}