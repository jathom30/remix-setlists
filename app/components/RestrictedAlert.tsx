import { Link } from "@remix-run/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { MaxWidth } from "./MaxWidth";
import { P } from "./typography";

export const RestrictedAlert = ({ dismissTo }: { dismissTo: string }) => {
  return (
    <MaxWidth className="p-2">
      <Card>
        <CardHeader>
          <CardTitle>Restricted Access</CardTitle>
          <CardDescription>
            You do not have proper access to perform this action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <P>
            To gain access, hand an <strong>Admin</strong> adjust your role in
            the band.
          </P>
        </CardContent>
        <CardFooter>
          <Button asChild variant="secondary">
            <Link to={dismissTo}>Ok</Link>
          </Button>
        </CardFooter>
      </Card>
    </MaxWidth>
  );
};
