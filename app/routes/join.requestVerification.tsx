import { data, redirect } from "@remix-run/node";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Mail } from "lucide-react";
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
import { ErrorMessage, FlexList } from "~/components";
import { verifyAccount } from "~/email/verify.server";
import { generateTokenLink, getUserByEmail } from "~/models/user.server";
import { getUser } from "~/session.server";
import { validateEmail } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";
import { honeypot } from "~/utils/honeypot.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const urlSearchParams = new URL(request.url).searchParams;
  const email = urlSearchParams.get("email");
  const user = await getUser(request);

  return { email, user };
}

export const meta: MetaFunction = () => {
  return [{ title: "Request Verification" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    honeypot.check(formData);
  } catch (error) {
    if (error instanceof Error) {
      throw data({ message: error.message }, { status: 400 });
    }
  }
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return data({
      errors: {
        email: "invalid email address",
      },
    });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return data({
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
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <Mail />
          Request Verification
        </CardTitle>
        <CardDescription>
          It looks like your account is not yet verified with us.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="put">
          <HoneypotInputs />
          <FlexList>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="Account email"
                defaultValue={displayEmail}
              />
              {actionData?.data.errors.email ? (
                <ErrorMessage message={actionData?.data.errors.email} />
              ) : null}
            </div>
          </FlexList>
        </Form>
      </CardContent>
      <CardFooter className="flex-col">
        <Button className="w-full" type="submit">
          Send email
        </Button>
        <Button className="w-full" asChild variant="ghost">
          <Link to="/login">Back to log in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
