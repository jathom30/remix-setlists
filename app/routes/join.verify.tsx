import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { Form, Link, useNavigation } from "react-router";
import { Ban, CheckCircle } from "lucide-react";
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
import { P } from "~/components/typography";
import { deleteToken } from "~/models/token.server";
import { compareToken, getUserById, verifyUser } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { safeRedirect } from "~/utils";
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

  // check if token matches and is still valid
  const isMatchingToken = await compareToken(decrypt(token), id);
  if (!isMatchingToken)
    throw new Response("Token does not match", { status: 403 });

  // if token is valid and matches user =>  verify user
  await verifyUser(id);

  return null;
}

export const meta: MetaFunction = () => {
  return [{ title: "Verified!" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const urlSearchParams = url.searchParams;
  const token = urlSearchParams.get("token");
  const id = urlSearchParams.get("id");
  const redirectTo = safeRedirect(urlSearchParams.get("redirectTo"), "/home");
  invariant(id, "User id not found");
  invariant(token, "Token not found");
  const user = await getUserById(id);

  if (!user) {
    return redirect("/join");
  }

  // delete token and sign in user
  await deleteToken(id);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export default function Verifying() {
  const navigation = useNavigation();
  const isSubmitting = useSpinDelay(navigation.state !== "idle");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle />
          Verified!
        </CardTitle>
        <CardDescription>
          Your account has been verified. You are one click away from create
          setlists with your band(s).
        </CardDescription>
      </CardHeader>
      <Form method="put">
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-lg m-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Ban />
            Oops...
          </CardTitle>
          <CardDescription>
            It looks like this link is either incorrect or too old.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <P>Click here to request a new email</P>
          <Button asChild variant="link">
            <Link to="/join/requestVerification">click here</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
