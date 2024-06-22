import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ArrowBigLeft } from "lucide-react";
import invariant from "tiny-invariant";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlexList } from "~/components";
import { H1, P } from "~/components/typography";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  return json({
    setlist,
  });
}

export default function SetlistCondensedPage() {
  const { setlist } = useLoaderData<typeof loader>();
  const totalSetLength = (set: (typeof setlist.sets)[0]) =>
    set.songs.reduce((total, song) => total + (song.song?.length || 0), 0);
  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" gap={2}>
        <Button variant="ghost" size="icon" title="Back to detail view" asChild>
          <Link to={`/${setlist.bandId}/setlists/${setlist.id}`}>
            <ArrowBigLeft className="h-4 w-4" />
          </Link>
        </Button>
        <H1>{setlist.name}</H1>
      </FlexList>
      <div className="grid gap-2 sm:grid-cols-2">
        {setlist.sets.map((set, index) => (
          <Card key={set.id}>
            <CardHeader>
              <CardTitle className="text-lg">Set {index + 1}</CardTitle>
              <CardDescription>
                {totalSetLength(set)}{" "}
                {totalSetLength(set) === 1 ? "minute" : "minutes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {set.songs.map((song, songIndex) => (
                <P key={song.songId}>
                  {songIndex + 1}. {song.song?.name}
                </P>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
