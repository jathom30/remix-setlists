import { faChevronLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import {
  Button,
  ErrorMessage,
  Field,
  FlexList,
  Input,
  ItemBox,
  Link,
} from "~/components";
import { verifyAccount } from "~/email/verify";
import { generateTokenLink, getUserByEmail } from "~/models/user.server";
import { getUser } from "~/session.server";
import { validateEmail } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";
import { honeypot } from "~/utils/honeypot.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const urlSearchParams = new URL(request.url).searchParams;
  const email = urlSearchParams.get("email");
  const user = await getUser(request);

  return json({ email, user });
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

  if (!validateEmail(email)) {
    return json({
      errors: {
        email: "invalid email address",
      },
    });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return json({
      errors: {
        email: "User does not exist with this email",
      },
    });
  }

  const domainUrl = getDomainUrl(request);
  // send email
  const magicLink = await generateTokenLink(email, "join/verify", domainUrl);
  verifyAccount(email, magicLink);
  return redirect("/join/verificationSent");
}

export default function RequestVerification() {
  const { email, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const displayEmail = user?.email || email || "";
  return (
    <FlexList pad={4}>
      <FontAwesomeIcon icon={faEnvelope} size="5x" />
      <h1 className="text-center text-2xl font-bold">
        Request a verification email
      </h1>
      <p className="text-sm text-slate-500 text-center">
        It looks like your account is not yet verified with us
      </p>
      <ItemBox>
        <Form method="put">
          <HoneypotInputs />
          <FlexList>
            <Field name="email" label="Email">
              <Input
                name="email"
                type="email"
                placeholder="Account email"
                defaultValue={displayEmail}
              />
              {actionData?.errors.email ? (
                <ErrorMessage message={actionData?.errors.email} />
              ) : null}
            </Field>

            <Button kind="primary" type="submit">
              Send email
            </Button>
            <Link to="/login" kind="ghost" icon={faChevronLeft}>
              Back to log in
            </Link>
          </FlexList>
        </Form>
      </ItemBox>
    </FlexList>
  );
}
