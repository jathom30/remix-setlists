import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { AudioLines, Boxes, Dna, Link2, List, Settings } from "lucide-react";
import pluralize from "pluralize";
import { toast } from "sonner";
import invariant from "tiny-invariant";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlexList } from "~/components";
import { FeelContainer } from "~/components/feel-container";
import { SetlistContainer } from "~/components/setlist-container";
import { SongContainer } from "~/components/song-container";
import { H1, Small, P } from "~/components/typography";
import { prisma } from "~/db.server";
import { useLiveLoader } from "~/hooks";
import { getBand } from "~/models/band.server";
import { getMostRecentFeels } from "~/models/feel.server";
import { getRecentSetlists } from "~/models/setlist.server";
import { getRecentSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { useMemberRole, useUser } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const setlistCount = await prisma.setlist.count({
    where: { bandId },
  });
  const songCount = await prisma.song.count({
    where: { bandId },
  });
  const feelCount = await prisma.feel.count({
    where: { bandId },
  });
  const counts = {
    setlists: setlistCount,
    songs: songCount,
    feels: feelCount,
  };
  const setlists = await getRecentSetlists(bandId);
  const songs = await getRecentSongs(bandId);
  const feels = await getMostRecentFeels(bandId);
  return { setlists, songs, band, feels, counts };
}

export type TSetlistBandId = ReturnType<
  typeof useLoaderData<typeof loader>
>["setlists"][number];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.band.name || "Band Home" }];
};

export default function BandId() {
  const { setlists, songs, band, feels, counts } = useLiveLoader<typeof loader>(
    () => toast("We've updated your dashboard with the latest data."),
  );
  const user = useUser();
  const role = useMemberRole();
  const isSub = role === RoleEnum.SUB;
  return (
    <div className="p-2 space-y-2">
      <H1>Band Home</H1>
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Avatar>
              <AvatarImage src={band.icon?.path || ""} alt={band.name} />
              <AvatarFallback>
                {band.name.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {band.name}
          </CardTitle>
          <CardDescription>
            Created on {new Date(band.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FlexList direction="row" items="center" gap={2}>
            <Badge variant="secondary">
              {band.members.find((member) => member.userId === user.id)?.role}
            </Badge>
            <Small>{pluralize("member", band.members.length, true)}</Small>
          </FlexList>
          <FlexList direction="row" gap={2} wrap>
            <Badge variant="outline">
              {pluralize("setlist", counts.setlists, true)}
            </Badge>
            <Badge variant="outline">
              {pluralize("songs", counts.songs, true)}
            </Badge>
            <Badge variant="outline">
              {pluralize("feels", counts.feels, true)}
            </Badge>
          </FlexList>
        </CardContent>
      </Card>
      <div className="grid gap-2 md:grid-cols-2">
        <Card>
          <CardHeader>
            <FlexList direction="row" items="center" justify="between">
              <CardTitle className="flex">
                <List className="mr-2" />
                Recent Setlists
              </CardTitle>
              {setlists.length ? (
                <Button variant="outline" asChild>
                  <Link to="setlists">See all</Link>
                </Button>
              ) : null}
            </FlexList>
            <CardDescription>
              Here are the most recently updated setlists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlexList gap={1}>
              {setlists.map((setlist) => (
                <Link key={setlist.id} to={`setlists/${setlist.id}`}>
                  <SetlistContainer.Card>
                    <SetlistContainer.Setlist setlist={setlist} />
                  </SetlistContainer.Card>
                </Link>
              ))}
            </FlexList>
            {setlists.length === 0 ? (
              <div className="text-center">
                <P>This band has no setlists yet.</P>
                {!isSub ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="setlists/new">
                      Create your first setlist here
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <FlexList direction="row" items="center" justify="between">
              <CardTitle className="flex">
                <AudioLines className="mr-2" />
                Recent Songs
              </CardTitle>
              {songs.length ? (
                <Button variant="outline" asChild>
                  <Link to="songs">See all</Link>
                </Button>
              ) : null}
            </FlexList>
            <CardDescription>
              Here are the most recently updated songs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlexList gap={1}>
              {songs.map((song) => (
                <Link key={song.id} to={`songs/${song.id}`}>
                  <SongContainer.Card>
                    <SongContainer.Song song={song} />
                  </SongContainer.Card>
                </Link>
              ))}
            </FlexList>
            {songs.length === 0 ? (
              <div className="text-center">
                <P>This band has no songs yet.</P>
                {!isSub ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="songs/new">Create your first song here</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <FlexList direction="row" items="center" justify="between">
              <CardTitle className="flex">
                <Dna className="mr-2" />
                Recent Feels
              </CardTitle>
              {songs.length ? (
                <Button variant="outline" asChild>
                  <Link to="feels">See all</Link>
                </Button>
              ) : null}
            </FlexList>
            <CardDescription>
              Here are the most recently updated feels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlexList gap={1}>
              {feels.map((feel) => (
                <Link key={feel.id} to={`feels/${feel.id}`}>
                  <FeelContainer.Card>
                    <FeelContainer.Feel feel={feel} />
                  </FeelContainer.Card>
                </Link>
              ))}
            </FlexList>
            {feels.length === 0 ? (
              <div className="text-center">
                <P>This band has no feels yet.</P>
                {!isSub ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="feels/new">Create your first feel here</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex">
              <Link2 className="mr-2" />
              Additional Links
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <Button className="w-full" variant="outline" asChild>
              <Link to="band-settings">
                <Settings className="h-4 w-4 mr-2" />
                Band Settings
              </Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/home">
                <Boxes className="h-4 w-4 mr-2" />
                Back to Band Selection
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
