import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import * as React from "react";
import { HoneypotInputs } from "remix-utils/honeypot/react";

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
import { CatchContainer, ErrorContainer, MaxWidth } from "~/components";
import { verifyAccount } from "~/email/verify";
import { generateTokenLink, verifyLogin } from "~/models/user.server";
import { createUserSession, getUser } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";
import { honeypot } from "~/utils/honeypot.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (user?.verified) return redirect("/home");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    honeypot.check(formData);
  } catch (error) {
    if (error instanceof Error) {
      throw json({ message: error.message }, { status: 400 });
    }
  }
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/home");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 },
    );
  }

  if (!user.verified) {
    const domainUrl = getDomainUrl(request);
    const magicLink = await generateTokenLink(email, "join/verify", domainUrl);
    verifyAccount(email, magicLink);
    return redirect("/join/verificationSent");
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Login",
    },
  ];
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/home";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Log in</CardTitle>
            </CardHeader>
            <CardContent>
              <HoneypotInputs />
              <div>
                <Label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </Label>
                <div className="mt-1">
                  <Input
                    ref={emailRef}
                    id="email"
                    required
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={actionData?.errors?.email ? true : undefined}
                    aria-describedby="email-error"
                    className="input input-bordered w-full"
                  />
                  {actionData?.errors?.email ? (
                    <div className="pt-1 text-error" id="email-error">
                      {actionData.errors.email}
                    </div>
                  ) : null}
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium">
                  Password
                </Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    ref={passwordRef}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={
                      actionData?.errors?.password ? true : undefined
                    }
                    aria-describedby="password-error"
                    className="input input-bordered w-full"
                  />
                  {actionData?.errors?.password ? (
                    <div className="pt-1 text-error" id="password-error">
                      {actionData.errors.password}
                    </div>
                  ) : null}
                </div>
              </div>
              <input type="hidden" name="redirectTo" value={redirectTo} />
            </CardContent>
            <CardFooter className="flex-col">
              <Button className="w-full" type="submit">
                Log in
              </Button>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="checkbox"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm">
                    Remember me
                  </label>
                </div>
                <Button variant="link" asChild>
                  <Link
                    to={{
                      pathname: "/forgotPassword",
                      search: searchParams.toString(),
                    }}
                  >
                    Forgot password
                  </Link>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Button asChild variant="link">
                  <Link
                    className="link link-primary"
                    to={{
                      pathname: "/join",
                      search: searchParams.toString(),
                    }}
                  >
                    Sign up
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Form>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  if (error.status === 401) {
    return (
      <div className="h-full">
        <MaxWidth className="p-2">
          <Card>
            <CardHeader>
              <CardTitle>Your account has been locked</CardTitle>
              <CardDescription>
                You have exceeded the maximum number of attempts. Your account
                will remain locked until you reset your password.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary">
                <Link to="/forgotPassword">Reset password</Link>
              </Button>
            </CardFooter>
          </Card>
        </MaxWidth>
      </div>
    );
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
