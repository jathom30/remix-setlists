import { LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";
import { Boxes } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlexHeader, FlexList, Header, MaxWidth } from "~/components";
import { FeelContainer } from "~/components/feel-container";
import { SongContainer } from "~/components/song-container";
import { H1, Muted, P, Small } from "~/components/typography";
import { UserAvatarMenu } from "~/components/user-avatar-menu";
import { getVerifiedUsers } from "~/models/admin.server";
import { requireUser } from "~/session.server";
import { ADMIN_EMAIL } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (user.email !== ADMIN_EMAIL) {
    return redirect("/home");
  }

  const users = await getVerifiedUsers();
  return { users };
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
      <MaxWidth>
        <div className="p-2 space-y-2">
          <H1>Admin</H1>
          <FlexList>
            <Accordion type="multiple">
              {users.map((user) => (
                <AccordionItem value={user.id} key={user.id}>
                  <AccordionTrigger>{user.name}</AccordionTrigger>
                  <AccordionContent>
                    <Card key={user.id}>
                      <CardHeader>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple">
                          <AccordionItem value="bands">
                            <AccordionTrigger>
                              Bands ({user.bands.length})
                            </AccordionTrigger>
                            <AccordionContent>
                              {user.bands.map((band) => (
                                <Accordion
                                  type="multiple"
                                  key={band.bandId}
                                  className="ml-2"
                                >
                                  <AccordionItem value={band.bandName}>
                                    <AccordionTrigger value={band.bandName}>
                                      {band.bandName}
                                    </AccordionTrigger>

                                    <AccordionContent>
                                      <Accordion
                                        type="multiple"
                                        className="ml-2"
                                      >
                                        <AccordionItem value="setlists">
                                          <AccordionTrigger>
                                            Setlists (
                                            {band.band?.setlists.length})
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <FlexList>
                                              {band.band?.setlists.map(
                                                (setlist) => (
                                                  <SongContainer.Card
                                                    key={setlist.id}
                                                  >
                                                    <FlexHeader>
                                                      <FlexList gap={0}>
                                                        <P>{setlist.name}</P>
                                                        <Muted>
                                                          Sets:{" "}
                                                          {setlist.sets.length}
                                                        </Muted>
                                                      </FlexList>
                                                      <FlexList items="end">
                                                        <Small>
                                                          {new Date(
                                                            setlist.createdAt,
                                                          ).toLocaleDateString()}
                                                        </Small>
                                                        <Muted>
                                                          Total Songs:{" "}
                                                          {setlist.sets.reduce(
                                                            (total, set) =>
                                                              (total +=
                                                                set.songs
                                                                  .length),
                                                            0,
                                                          )}
                                                        </Muted>
                                                      </FlexList>
                                                    </FlexHeader>
                                                  </SongContainer.Card>
                                                ),
                                              )}
                                            </FlexList>
                                          </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="songs">
                                          <AccordionTrigger>
                                            Songs ({band.band?.song.length})
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <FlexList>
                                              {band.band?.song.map((song) => (
                                                <SongContainer.Card
                                                  key={song.id}
                                                >
                                                  <SongContainer.Song
                                                    song={song}
                                                  />
                                                </SongContainer.Card>
                                              ))}
                                            </FlexList>
                                          </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="feels">
                                          <AccordionTrigger>
                                            Feels ({band.band?.feels.length})
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <FlexList>
                                              {band.band?.feels.map((feel) => (
                                                <FeelContainer.Card
                                                  key={feel.id}
                                                >
                                                  <FeelContainer.Feel
                                                    feel={feel}
                                                  />
                                                </FeelContainer.Card>
                                              ))}
                                            </FlexList>
                                          </AccordionContent>
                                        </AccordionItem>
                                      </Accordion>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FlexList>
        </div>
      </MaxWidth>
    </div>
  );
}
