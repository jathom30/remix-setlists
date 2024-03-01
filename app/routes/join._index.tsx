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
import invariant from "tiny-invariant";

import {
  Button,
  CatchContainer,
  ErrorContainer,
  FlexList,
  PasswordStrength,
} from "~/components";
import { verifyAccount } from "~/email/verify";
import {
  createUser,
  generateTokenLink,
  getUserByEmail,
} from "~/models/user.server";
import { getUserId } from "~/session.server";
import { validateEmail } from "~/utils";
import {
  getDomainUrl,
  getPasswordError,
  passwordStrength,
} from "~/utils/assorted";
import { honeypot } from "~/utils/honeypot.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
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
  const name = formData.get("name");
  // const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  invariant(process.env.SENDGRID_API_KEY, "sendgrid api key must be set");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null, name: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required", name: null } },
      { status: 400 },
    );
  }

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { email: null, password: null, name: "Name is required" } },
      { status: 400 },
    );
  }

  const { tests } = passwordStrength(password);
  const passwordError = getPasswordError(tests);

  if (passwordError) {
    return json(
      {
        errors: {
          email: null,
          password: passwordError,
          name: null,
        },
        success: false,
      },
      { status: 400 },
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
          name: null,
        },
        success: false,
      },
      { status: 400 },
    );
  }

  await createUser(email, password, name);
  const domainUrl = getDomainUrl(request);
  // send email
  const magicLink = await generateTokenLink(email, "join/verify", domainUrl);
  verifyAccount(email, magicLink);

  return redirect("verificationSent");
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Sign Up",
    },
  ];
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const [password, setPassword] = React.useState("");

  const { tests, strength } = passwordStrength(password);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="h-full">
      <FlexList pad={4}>
        <Form method="post" className="space-y-6">
          <HoneypotInputs />
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <div className="mt-1">
              <input
                ref={nameRef}
                id="name"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="name"
                type="text"
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
                className="input input-bordered w-full"
              />
              {actionData?.errors?.name ? (
                <div className="pt-1 text-error" id="email-error">
                  {actionData.errors.name}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
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
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="input input-bordered w-full"
              />
              <div className="pt-2">
                <PasswordStrength tests={tests} strength={strength} />
              </div>
              {actionData?.errors?.password ? (
                <div className="pt-1 text-error" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <FlexList>
            <Button type="submit" kind="primary">
              Create Account
            </Button>
          </FlexList>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                className="link link-primary"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </FlexList>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
