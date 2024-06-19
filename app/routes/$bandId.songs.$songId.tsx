import { faMaximize, faMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  type LoaderFunctionArgs,
  json,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlexList } from "~/components";
import { H1, Muted, P } from "~/components/typography";
import { deleteSong, getSong } from "~/models/song.server";
import { requireUser } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);
  const { bandId, songId } = params;
  invariant(bandId, "bandId is required");
  invariant(songId, "songId is required");

  const response = await getSong(songId, bandId);
  const song = response?.song;
  const setlists = response?.setlists;
  if (!song) {
    throw new Response("Song not found", { status: 404 });
  }
  return json({ song, setlists });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);
  const { songId, bandId } = params;
  invariant(songId, "songId is required");
  invariant(bandId, "bandId is required");
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const response = await deleteSong(songId);
    if (!response) {
      throw new Response("Song not found", { status: 404 });
    }
    return redirect(`/${bandId}/songs`);
  }

  return null;
}

export default function SongPage() {
  const { song } = useLoaderData<typeof loader>();
  const [expandNotes, setExpandNotes] = useState(false);

  const splitNote = song.note?.split("\n");
  const position =
    {
      other: "Other",
      opener: "Opener",
      closer: "Closer",
    }[song.position] || song.position;

  const positionDetail =
    {
      other: "This song will be placed anywhere in the setlist.",
      opener: "This song will be placed towards the start of the set.",
      closer: "This song will be placed towards the end of the set.",
    }[song.position] || "";
  const rank =
    {
      no_preference: "No Preference",
      exclude: "Always Exclude",
    }[song.rank] || song.rank;
  const rankDetail =
    {
      no_preference: "This song can be included in any setlist.",
      exclude: "This song will never be included in a setlist.",
    }[song.rank] || "";

  return (
    <div className="p-2 space-y-2">
      <H1>Song Details</H1>
      <Card>
        <CardHeader>
          <CardTitle>{song.name}</CardTitle>
          <CardDescription>{song.author}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Length</Label>
              <P>
                {song.length} {song.length === 1 ? "minute" : "minutes"}
              </P>
            </div>
            <div>
              <Label>Key</Label>
              <P>
                {song.keyLetter} {song.isMinor ? "Minor" : "Major"}
              </P>
            </div>
            <div>
              <Label>Tempo</Label>
              <P>{song.tempo} BPM</P>
            </div>
          </div>
          {song.feels.length ? (
            <div className="pt-4">
              <Label>Feels</Label>
              <FlexList direction="row" wrap>
                {song.feels?.map((feel) => (
                  <P key={feel.id}>
                    <FlexList direction="row" items="center" gap={1}>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ background: feel.color || undefined }}
                      />
                      {feel.label}
                    </FlexList>
                  </P>
                ))}
              </FlexList>
            </div>
          ) : null}
        </CardContent>
      </Card>
      {splitNote?.length ? (
        <Card>
          <CardHeader>
            <FlexList direction="row" justify="between" items="center">
              <CardTitle>Lyrics/Notes</CardTitle>
              <Button
                onClick={() => setExpandNotes((prev) => !prev)}
                variant="ghost"
                title={
                  expandNotes ? "Collapse note section" : "Expand note section"
                }
              >
                <FontAwesomeIcon icon={expandNotes ? faMinimize : faMaximize} />
              </Button>
            </FlexList>
          </CardHeader>
          <CardContent>
            {expandNotes ? (
              splitNote.map((note, i) => <P key={i}>{note}</P>)
            ) : (
              <ScrollArea className=" h-24">
                {splitNote.map((note, i) => (
                  <P key={i}>{note}</P>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      ) : null}
      {song.links?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            <FlexList items="start">
              {song.links.map((link) => (
                <Button asChild variant="link" key={link.id}>
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.href}
                  </a>
                </Button>
              ))}
            </FlexList>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Setlist Creation Settings</CardTitle>
          <CardDescription>
            These settings will be used when you create setlists using our
            "auto-magic" feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlexList>
            <div>
              <Label>Position</Label>
              <P>{position}</P>
              <Muted>{positionDetail}</Muted>
            </div>
            <div>
              <Label>Importance</Label>
              <P>{rank}</P>
              <Muted>{rankDetail}</Muted>
            </div>
          </FlexList>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Deleting this song is a perminant action and cannot be undone. It
            will be removed from all setlists and will no longer be available
            for use.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <DeleteSongDialog />
        </CardFooter>
      </Card>
    </div>
  );
}

const DeleteSongDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Song</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this song
            from all setlists and will no longer be available for use.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
