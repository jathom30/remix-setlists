import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { Form, Link } from "react-router";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlexList } from "~/components";
import { Muted, P } from "~/components/typography";
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

export const meta: MetaFunction = () => {
  return [{ title: "Verification Sent" }];
};

export default function VerificationSent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <Mail />
          Verification Sent
        </CardTitle>
        <CardDescription>
          We've sent you an email with a verification link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <P>
          Please click the link in that email to verify your account and start
          using <strong>setlists.pro</strong>
        </P>
      </CardContent>
      <FlexList pad={4}>
        <Form method="put" className="flex gap-2 items-center">
          <Muted>Need a fresh link? </Muted>
          <Button asChild variant="link">
            <Link to="/join/requestVerification">click here</Link>
          </Button>
        </Form>
      </FlexList>
    </Card>
  );
}
