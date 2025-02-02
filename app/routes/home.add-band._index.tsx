import { Link, MetaFunction } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, P } from "~/components/typography";

export const meta: MetaFunction = () => {
  return [{ title: "Add Band" }];
};

export default function BandNew() {
  return (
    <div className="p-2 space-y-2">
      <H1>Add Band</H1>
      <P>
        You can either create a new band or add yourself to an existing band if
        you've been given a band code.
      </P>
      <div className="flex gap-4 flex-col md:flex-row">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Band</CardTitle>
            <CardDescription>
              Create a brand new band and then invite your friends to join.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="new">Create New Band</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Join an Existing Band</CardTitle>
            <CardDescription>
              If you've received a band code, you can join an existing band.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="existing">Join Existing Band</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
