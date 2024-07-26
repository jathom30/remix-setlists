import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FlexList, Header, MaxWidth } from "~/components";
import { FeelContainer } from "~/components/feel-container";
import { SongContainer } from "~/components/song-container";
import { H1, H4 } from "~/components/typography";
import { UserAvatarMenu } from "~/components/user-avatar-menu";
import { getVerifiedUsers } from "~/models/admin.server";
import { requireUser } from "~/session.server";
import { ADMIN_EMAIL } from "~/utils";
// import { SetlistContainer } from "~/components/setlist-container";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (user.email !== ADMIN_EMAIL) {
    return redirect("/home");
  }

  const users = await getVerifiedUsers();
  return json({ users });
}

export default function AdminIndex() {
  const { users } = useLoaderData<typeof loader>();
  return (
    <div className="bg-muted/40 h-full">
      <div className="sticky border-b top-0 z-10 bg-background inset-x-0 flex items-center justify-between p-2 gap-2">
        <MaxWidth>
          <Header>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/home">
                <FlexList direction="row" gap={2}>
                  <Boxes className="w-4 h-4" />
                  Bands
                </FlexList>
              </Link>
            </Button>
            <FlexList direction="row" items="center" gap={2}>
              <UserAvatarMenu />
            </FlexList>
          </Header>
        </MaxWidth>
      </div>
      <div className="p-2 space-y-2">
        <H1>Admin</H1>
        <FlexList>
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <FlexList>
                  {user.bands.map((band) => (
                    <Card key={band.bandId}>
                      <CardHeader>
                        <CardTitle>{band.bandName}</CardTitle>
                        <CardDescription>{band.role}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FlexList>
                          <H4>Songs</H4>
                          {band.band?.song.map((song) => (
                            <SongContainer.Card key={song.id}>
                              <SongContainer.Song song={song} />
                            </SongContainer.Card>
                          ))}
                        </FlexList>
                        <Separator className="mt-4 mb-2" />
                        <FlexList>
                          <H4>Feels</H4>
                          {band.band?.feels.map((feel) => (
                            <FeelContainer.Card key={feel.id}>
                              <FeelContainer.Feel feel={feel} />
                            </FeelContainer.Card>
                          ))}
                        </FlexList>
                      </CardContent>
                    </Card>
                  ))}
                </FlexList>
              </CardContent>
            </Card>
          ))}
        </FlexList>
      </div>
    </div>
  );
}
