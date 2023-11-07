import {
  faChevronLeft,
  faEnvelope,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  Button,
  ErrorMessage,
  Field,
  FlexList,
  Input,
  ItemBox,
  Link,
} from "~/components";
import { passwordReset } from "~/email/password";
import { generateTokenLink, getUserByEmail } from "~/models/user.server";
import { validateEmail } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  invariant(process.env.SENDGRID_API_KEY, "sendgrid api key must be set");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid" }, email: null },
      { status: 400 },
    );
  }

  // check if user email exists before sending email
  const user = await getUserByEmail(email);
  if (!user) {
    return json({
      errors: { email: "User does not exist with this email" },
      email: null,
    });
  }

  const domainUrl = getDomainUrl(request);
  // generate token link and send email
  const magicLink = await generateTokenLink(email, "resetPassword", domainUrl);
  passwordReset(email, magicLink);

  return json({ errors: null, email });
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const emailError = actionData?.errors?.email;
  const emailSuccess = actionData?.email;

  return (
    <div className="max-w-lg m-auto mt-8">
      <FlexList pad={4}>
        {emailSuccess ? (
          <>
            <FontAwesomeIcon icon={faEnvelope} size="5x" />
            <h1 className="text-center text-2xl font-bold">Check your email</h1>
            <span className="text-center text-sm text-slate-500">
              We sent a password reset link to <strong>{emailSuccess}</strong>
            </span>
            <ItemBox>
              <Form method="put">
                <span className="text-center text-sm text-slate-500">
                  Didn't receive the email?{" "}
                  <button
                    name="intent"
                    value="resend"
                    className="text-blue-500 underline"
                  >
                    Click to resend
                  </button>
                </span>
              </Form>
            </ItemBox>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faKey} size="5x" />
            <h1 className="text-center text-2xl font-bold">Forgot password?</h1>
            <span className="text-center text-sm text-slate-500">
              No worries, we'll send you reset instructions.
            </span>
            <ItemBox>
              <Form method="put">
                <FlexList>
                  <Field name="email" label="Email">
                    <Input name="email" placeholder="Enter your email" />
                  </Field>
                  {emailError ? <ErrorMessage message={emailError} /> : null}
                  <Button type="submit" kind="primary">
                    Reset password
                  </Button>
                </FlexList>
              </Form>
            </ItemBox>
          </>
        )}
        <Link to="/login" icon={faChevronLeft}>
          Back to log in
        </Link>
      </FlexList>
    </div>
  );
}
