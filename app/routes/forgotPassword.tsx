import { json } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage, FlexList } from "~/components";
import { Small } from "~/components/typography";
import { passwordReset } from "~/email/password";
import { generateTokenLink, getUserByEmail } from "~/models/user.server";
import { validateEmail } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";

export const meta: MetaFunction = () => {
  return [{ title: "Forgot Password" }];
};

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
        <Card>
          {emailSuccess ? (
            <>
              <CardHeader>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  {" "}
                  We sent a password reset link to{" "}
                  <strong>{emailSuccess}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Small>Didn't receive the email?</Small>
              </CardContent>
              <Form method="put">
                <CardFooter>
                  <Button className="w-full" name="intent" value="resend">
                    Click to resent
                  </Button>
                </CardFooter>
              </Form>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Forgot Password?</CardTitle>
                <CardDescription>
                  No worries, we'll send you reset instructions.
                </CardDescription>
              </CardHeader>
              <Form method="put">
                <CardContent>
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" placeholder="Enter your email" />
                  {emailError ? <ErrorMessage message={emailError} /> : null}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit">
                    Reset password
                  </Button>
                </CardFooter>
              </Form>
            </>
          )}
        </Card>
        <Button variant="ghost" asChild>
          <Link to="/login">Back to log in</Link>
        </Button>
      </FlexList>
    </div>
  );
}
