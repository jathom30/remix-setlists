import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
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
                <FontAwesomeIcon icon={faAdd} className="mr-2" />
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
                <CardHeader className="flex-row gap-4 flex-wrap">
                  {band.icon?.path ? (
                    <Avatar>
                      <AvatarImage src={band.icon.path} alt={band.name} />
                    </Avatar>
                  ) : null}
                  <H3>{band.name}</H3>
                  <div className="flex-grow" />
                  <Badge variant="outline">
                    {
                      band.members.find((member) => member.userId === user.id)
                        ?.role
                    }
                  </Badge>
                  <Badge variant="secondary">
                    {band.members.length}{" "}
                    {band.members.length === 1 ? "Member" : "Members"}
                  </Badge>
                </CardHeader>
              </Card>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
