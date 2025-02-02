import { Link, MetaFunction, useParams } from "react-router";
import { LoaderFunctionArgs } from "react-router";
import { Hammer, WandSparkles } from "lucide-react";
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
import { H1 } from "~/components/typography";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);
  return null;
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "New Setlist" }];
};

export default function CreateSetlist() {
  const { bandId } = useParams();
  return (
    <div className="p-2 space-y-2">
      <H1>Create Setlist</H1>
      <Card>
        <CardHeader>
          <CardTitle>Creation Type</CardTitle>
          <CardDescription>
            Setlists can either me created manually or auto-magically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Auto</CardTitle>
                <CardDescription>
                  Generate a setlist in three easy steps. We'll do the heavy
                  lifting for you.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="secondary"
                  size="lg"
                  asChild
                >
                  <Link to={`/${bandId}/setlists/auto`}>
                    <WandSparkles className="w-4 h-4 mr-2" />
                    Auto-Magically
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Manual</CardTitle>
                <CardDescription>
                  Create a setlist from scratch. Add, remove, and sort songs as
                  you please.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" variant="secondary" asChild>
                  <Link to={`/${bandId}/setlists/manual`}>
                    <Hammer className="w-4 h-4 mr-2" />
                    Manual
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
