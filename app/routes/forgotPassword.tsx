import sgMail from '@sendgrid/mail'
import { faChevronLeft, faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Form, useActionData } from "@remix-run/react"
import { json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/server-runtime"
import { Button, ErrorMessage, Field, FlexList, Input, ItemBox, Link } from "~/components"
import { validateEmail } from "~/utils"
import invariant from 'tiny-invariant';
import { generateTokenLink, getUserByEmail } from '~/models/user.server';

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  invariant(process.env.SENDGRID_API_KEY, 'sendgrid api key must be set')

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid" }, email: null },
      { status: 400 }
    );
  }

  // check if user email exists before sending email
  const user = await getUserByEmail(email)
  if (!user) {
    return json(
      { errors: { email: 'User does not exist with this email' }, email: null }
    )
  }

  const magicLink = await generateTokenLink(email, 'resetPassword')

  const msg = {
    to: email,
    from: 'jathom30@gmail.com', // ! Once ready, update to support@setlists.pro
    subject: 'Password reset',
    text: 'click the link to reset your password',
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset</title>
      </head>
      <body>
        <main style="max-width: 500px; margin: auto;">
          <h3 style="text-align: center;">We received a request to reset your <strong>setlists</strong> password</h3>
          <p>Keeping your account secure is important to us. The link below will expire in 10 minutes. You can request a new link at anytime <a href="https://setlists.pro/forgotPassword">here</a>.</p>
          <div style="text-align: center;">
            <a
              href=${magicLink}
              style="border-radius: 10px; background-color: rgb(0, 119, 255); padding: 10px; text-decoration: none; color: white;"
            >
              Reset password
            </a>
          </div>
          <div>
            <p>If you did not request a password change, please contact us IMMEDIATELY so we can keep your account secure.</p>
            <p>Email us at <a href="mailto:support@setlists.pro?subject=Security issue">support@setlists.pro</a></p>
          </div>
        </main>
      </body>
    </html>`,
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
      console.log(response[0].headers)
    })
    .catch((error) => {
      console.error(error)
    })

  return json({ errors: null, email })
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>()
  const emailError = actionData?.errors?.email
  const emailSuccess = actionData?.email

  return (
    <div className="max-w-lg m-auto mt-8">
      <FlexList pad={4}>
        {emailSuccess ? (
          <>
            <FontAwesomeIcon icon={faEnvelope} size="5x" />
            <h1 className="text-center text-2xl font-bold">Check your email</h1>
            <span className="text-center text-sm text-slate-500">We sent a password reset link to <strong>{emailSuccess}</strong></span>
            <ItemBox>
              <Form method="put">
                <span className="text-center text-sm text-slate-500">Didn't receive the email? <button name="intent" value="resend" className="text-blue-500 underline">Click to resend</button></span>
              </Form>
            </ItemBox>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faKey} size="5x" />
            <h1 className="text-center text-2xl font-bold">Forgot password?</h1>
            <span className="text-center text-sm text-slate-500">No worries, we'll send you reset instructions.</span>
            <ItemBox>
              <Form method="put">
                <FlexList>
                  <Field name='email' label='Email'>
                    <Input name="email" placeholder="Enter your email" />
                  </Field>
                  {emailError ? <ErrorMessage message={emailError} /> : null}
                  <Button type="submit" kind="primary">Reset password</Button>
                </FlexList>
              </Form>
            </ItemBox>
          </>
        )}
        <Link to="/login" icon={faChevronLeft}>Back to log in</Link>
      </FlexList>
    </div>
  )
}