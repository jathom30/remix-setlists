import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import { CirclePlus } from "lucide-react";
import pluralize from "pluralize";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { FlexList } from "~/components";
import { H1, H3, Small } from "~/components/typography";
import { getBands } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const bands = await getBands(userId);

  if (!bands) {
    throw new Response("Bands not found", { status: 404 });
  }
  return json({ bands });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "Your Bands" }];
};

export default function Home() {
  const { bands } = useLoaderData<typeof loader>();
  const user = useUser();

  const hasNoBands = bands.length === 0;
  return (
    <div className="p-2 space-y-2">
      <H1>Your Bands</H1>
      {hasNoBands ? (
        <NavLink to="add-band">
          <Card className="hover:bg-accent hover:text-accent-foreground">
            <CardHeader className="flex-row gap-4 items-center flex-wrap">
              <H3>
                <CirclePlus className="mr-2" />
                Create New
              </H3>
              <div className="flex-grow" />
              <Small>
                You have no bands. Click here to create or add a band to your
                account.
              </Small>
            </CardHeader>
          </Card>
        </NavLink>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
          {bands.map((band) => (
            <NavLink to={`/${band.id}`} key={band.id}>
              <Card className="hover:bg-accent hover:text-accent-foreground">
                <CardHeader>
                  <FlexList direction="row" items="center" gap={2}>
                    <Avatar>
                      <AvatarImage
                        src={band.icon?.path || ""}
                        alt={band.name}
                      />
                      <AvatarFallback>
                        {band.name.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <H3>{band.name}</H3>
                  </FlexList>
                  <FlexList direction="row" items="center" gap={2}>
                    <Badge variant="secondary">
                      {
                        band.members.find((member) => member.userId === user.id)
                          ?.role
                      }
                    </Badge>
                    <Badge variant="outline">
                      {pluralize("Member", band.members.length, true)}
                    </Badge>
                  </FlexList>
                </CardHeader>
              </Card>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
