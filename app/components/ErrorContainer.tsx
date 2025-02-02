import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { MaxWidth } from "./MaxWidth";

export const ErrorContainer = ({ error }: { error: Error }) => {
  console.error(error.message);
  return (
    <MaxWidth className="p-2">
      <Card>
        <CardHeader>
          <CardTitle>Oops</CardTitle>
          <CardDescription>
            Looks like something is broken. We are as disappointed as you are.
            Feel free to <a href="mailto:support@setlists.pro">email us</a> to
            alert us to the issue.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="secondary">
            <Link to=".">Try again?</Link>
          </Button>
        </CardFooter>
      </Card>
    </MaxWidth>
  );
};
