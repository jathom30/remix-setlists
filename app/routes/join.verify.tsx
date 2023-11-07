import {
  faCheckCircle,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useNavigation } from "@remix-run/react";
import { useSpinDelay } from "spin-delay";
import invariant from "tiny-invariant";

import { Button, FlexList, ItemBox } from "~/components";
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
    <Form method="put">
      <FlexList pad={4}>
        <FontAwesomeIcon icon={faCheckCircle} size="5x" />
        <h1 className="text-center text-2xl font-bold">Verified!</h1>
        <ItemBox>
          <FlexList>
            <p>
              Your account has been verified. You are one click away from create
              setlists with your band(s).
            </p>
            <Button type="submit" kind="primary" isSaving={isSubmitting}>
              Log in
            </Button>
          </FlexList>
        </ItemBox>
      </FlexList>
    </Form>
  );
}

export function ErrorBoundary() {
  return (
    <div className="max-w-lg m-auto mt-8">
      <FlexList pad={4}>
        <FontAwesomeIcon icon={faCircleXmark} size="5x" />
        <h1 className="text-center text-2xl font-bold">Oops...</h1>
        <ItemBox>
          <FlexList>
            <p>It looks like this link is either incorrect or too old.</p>
            <p>
              If you'd like to request a new email,{" "}
              <Link
                className="text-blue-500 underline"
                to="/join/requestVerification"
              >
                click here
              </Link>
              .
            </p>
          </FlexList>
        </ItemBox>
      </FlexList>
    </div>
  );
}
