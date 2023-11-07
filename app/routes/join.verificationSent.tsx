import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";

import { FlexList, ItemBox } from "~/components";
import { getUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user?.verified) {
    // if user and is verified redirect to login
    // once on login, they are redirected to home
    return redirect("/login");
  }
  return null;
}

export default function VerificationSent() {
  return (
    <FlexList pad={4}>
      <FontAwesomeIcon icon={faEnvelopeOpen} size="5x" />
      <h1 className="text-center text-2xl font-bold">Verification sent</h1>
      <ItemBox>
        <FlexList>
          <p>We've sent you an email with a verification link.</p>
          <p>
            Please click the link in that email to verify your account and start
            using <strong>setlists.pro</strong>
          </p>
        </FlexList>
      </ItemBox>
      <Form method="put">
        <span>
          Need a fresh link?{" "}
          <Link
            to="/join/requestVerification"
            className="text-blue-500 underline"
          >
            click here
          </Link>
          .
        </span>
      </Form>
    </FlexList>
  );
}
