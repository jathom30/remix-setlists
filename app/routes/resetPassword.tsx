import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Ban } from "lucide-react";
import { useState } from "react";
import { useSpinDelay } from "spin-delay";
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
import { ErrorMessage, FlexList, PasswordStrength } from "~/components";
import { deleteToken } from "~/models/token.server";
import {
  compareToken,
  getUserById,
  updateUser,
  updateUserPassword,
} from "~/models/user.server";
import { getPasswordError, passwordStrength } from "~/utils/assorted";
import { decrypt } from "~/utils/encryption.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const urlSearchParams = url.searchParams;
  const token = urlSearchParams.get("token");
  const id = urlSearchParams.get("id");
  invariant(token, "Token not found");
  invariant(id, "User id not found");
  const user = await getUserById(id);

  if (!user) {
    return redirect("/join");
  }

  const isMatchingToken = await compareToken(decrypt(token), id);

  if (!isMatchingToken) {
    throw new Response("token does not match", { status: 404 });
  }
  return json({ email: user.email });
}

export const meta: MetaFunction = () => {
  return [{ title: "Password Reset" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const urlSearchParams = url.searchParams;
  const id = urlSearchParams.get("id");
  invariant(id, "User id not found");

  const user = await getUserById(id);
  if (!user) {
    return redirect("/join");
  }

  const formData = await request.formData();
  const password = formData.get("password");
  const verifyPassword = formData.get("verifyPassword");

  if (typeof password !== "string" || typeof verifyPassword !== "string") {
    throw new Response("passwords are not strings");
  }

  const { tests } = passwordStrength(password);

  const passwordError = getPasswordError(tests);
  if (passwordError) {
    return json({
      errors: { password: passwordError, verifyPassword: null },
    });
  }
  if (password !== verifyPassword) {
    return json({
      errors: { password: null, verifyPassword: "passwords must match" },
    });
  }

  await updateUserPassword(user.id, password);
  await deleteToken(user.id);
  await updateUser(user.id, { locked: false });
  return redirect("/login");
}

export default function ResetPassword() {
  const { email } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = useSpinDelay(navigation.state !== "idle");
  const [password, setPassword] = useState("");
  const { tests, strength } = passwordStrength(password);

  const isValid = Object.values(tests).every((test) => test);

  return (
    <div className="max-w-lg m-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Set a new password for {email}</CardTitle>
        </CardHeader>
        <Form method="put">
          <CardContent>
            <FlexList>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Update password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                {actionData?.errors.password ? (
                  <ErrorMessage message={actionData?.errors.password} />
                ) : null}
              </div>
              <PasswordStrength tests={tests} strength={strength} />
              <div>
                <Label htmlFor="verifyPassword">Verify password</Label>
                <Input
                  name="verifyPassword"
                  type="password"
                  placeholder="Verify password"
                />
                {actionData?.errors?.verifyPassword ? (
                  <ErrorMessage message="Passwords must match" />
                ) : null}
              </div>
            </FlexList>
          </CardContent>
          <CardFooter className="flex-row">
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Resetting password..." : "Reset password"}
            </Button>
            <Button value="ghost" asChild>
              <Link to="/login">Back to log in</Link>
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-lg m-auto mt-8 h-screen flex items-center justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban />
            Oops...
          </CardTitle>
          <CardDescription>
            It looks like this link is either incorrect or too old.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="link" asChild>
            <Link to="/forgotPassword">Request a new email</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
