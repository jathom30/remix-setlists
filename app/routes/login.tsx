import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useCatch, useSearchParams } from "@remix-run/react";
import * as React from "react";
import { createUserSession, getUser } from "~/session.server";
import { generateTokenLink, verifyLogin } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";
import { verifyAccount } from "~/email/verify";
import { getDomainUrl } from "~/utils/assorted";
import { CatchContainer, ErrorContainer, FlexList, MaxWidth, Link as CustomLink, ItemBox, Button } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserLock } from "@fortawesome/free-solid-svg-icons";

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);

  if (user?.verified) return redirect("/home");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/home");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  if (!user.verified) {
    const domainUrl = getDomainUrl(request)
    const magicLink = await generateTokenLink(email, 'join/verify', domainUrl);
    verifyAccount(email, magicLink)
    return redirect('/join/verificationSent')
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
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
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="input input-bordered w-full"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-error" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="input input-bordered w-full"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-error" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <FlexList>
            <Button type="submit" kind="primary">
              Log in
            </Button>
          </FlexList>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="checkbox"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-neutral"
              >
                Remember me
              </label>
            </div>
            <Link
              className="text-sm link link-secondary"
              to={{
                pathname: "/forgotPassword",
                search: searchParams.toString(),
              }}
            >
              Forgot password
            </Link>
          </div>
          <div className="text-center text-sm text-neutral">
            Don't have an account?{" "}
            <Link
              className="link link-primary"
              to={{
                pathname: "/join",
                search: searchParams.toString(),
              }}
            >
              Sign up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch()
  if (caught.status === 401) {
    return (
      <div className="h-full">
        <MaxWidth>
          <FlexList pad={4} items="center">
            <FontAwesomeIcon icon={faUserLock} size="5x" />
            <ItemBox>
              <FlexList>
                <h1 className="font-bold text-xl text-danger">Your account has been locked</h1>
                <p>You have exceeded the maximum number of attempts. Your account will remain locked until you reset your password.</p>
                <CustomLink to="/forgotPassword" kind="secondary">Reset password</CustomLink>
              </FlexList>
            </ItemBox>
          </FlexList>
        </MaxWidth>
      </div>
    )
  }
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}