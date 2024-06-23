import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, json, useLoaderData, useNavigate } from "@remix-run/react";
import { Boxes, Settings } from "lucide-react";
import { useEffect } from "react";
import invariant from "tiny-invariant";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FlexList } from "~/components";
import { SetlistContainer } from "~/components/setlist-container";
import { SongContainer } from "~/components/song-container";
import { H1, P } from "~/components/typography";
import { getBand } from "~/models/band.server";
import { getRecentSetlists } from "~/models/setlist.server";
import { getRecentSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { useFeatureFlags, useUser } from "~/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const setlists = await getRecentSetlists(bandId);
  const songs = await getRecentSongs(bandId);
  return json({ setlists, songs, band });
}

const useRedirectHome = () => {
  const navigate = useNavigate();
  const { rebranding } = useFeatureFlags();
  useEffect(() => {
    if (!rebranding) {
      navigate("/home");
    }
  }, [rebranding, navigate]);
};

export default function BandId() {
  useRedirectHome();
  const { setlists, songs, band } = useLoaderData<typeof loader>();
  const user = useUser();
  return (
    <div className="p-2 space-y-2">
      <H1>Band Home</H1>
      <Card>
        <CardHeader>
          <CardTitle>{band.name}</CardTitle>
          <CardDescription>
            <P>Created on {new Date(band.createdAt).toLocaleDateString()}</P>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 items-start">
            <Label>Your Role within the band</Label>
            <Badge variant="secondary">
              {band.members.find((member) => member.userId === user.id)?.role}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>Recent Setlists</CardTitle>
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
                <SetlistContainer setlist={setlist} />
              </Link>
            ))}
          </FlexList>
          {setlists.length === 0 ? (
            <div className="text-center">
              <P>This band has no setlists yet.</P>
              <Button asChild>
                <Link to="setlists/new">Create your first setlist here</Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>Recent Songs</CardTitle>
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
              <Button asChild>
                <Link to="songs/new">Create your first song here</Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Additional Links</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
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
  );
}
