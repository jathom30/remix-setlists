import {
  type LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { Maximize, Minimize, Pencil, Trash } from "lucide-react";
import pluralize from "pluralize";
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
import { SetlistContainer } from "~/components/setlist-container";
import { H1, Muted, P } from "~/components/typography";
import { deleteSong, getSong } from "~/models/song.server";
import { requireUser } from "~/session.server";
import { useMemberRole } from "~/utils";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { RoleEnum } from "~/utils/enums";
import { redirectWithToast } from "~/utils/toast.server";

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
  return { song, setlists };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.song.name || "Song Detail" }];
};

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
    emitter.emit(emitterKeys.songs);
    emitter.emit(emitterKeys.dashboard);
    return redirectWithToast(`/${bandId}/songs`, {
      title: "Song Deleted",
      description: "The song has been deleted successfully.",
      type: "success",
    });
  }

  return null;
}

export type TSetlistFromSong = ReturnType<
  typeof useLoaderData<typeof loader>
>["setlists"];

export default function SongPage() {
  const { song, setlists } = useLoaderData<typeof loader>();
  const [expandNotes, setExpandNotes] = useState(false);
  const isSub = useMemberRole() === RoleEnum.SUB;

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
      <FlexList direction="row" justify="between" items="center">
        <H1>Song</H1>
        {!isSub ? (
          <Button asChild>
            <Link to="edit">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Song
            </Link>
          </Button>
        ) : null}
      </FlexList>
      <Card>
        <CardHeader>
          <CardTitle>{song.name}</CardTitle>
          <CardDescription>{song.author}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Length</Label>
              <P>{pluralize("minute", song.length, true)}</P>
            </div>
            <div>
              <Label>Key</Label>
              <P>
                {song.keyLetter} {song.isMinor ? "Minor" : "Major"}
              </P>
            </div>
            <div>
              <Label>Tempo</Label>
              <P>{song.tempo ? `${song.tempo} BPM` : "--"}</P>
            </div>
          </div>
          {song.feels.length ? (
            <div className="pt-4">
              <Label>Feels</Label>
              <FlexList direction="row" wrap>
                {song.feels?.map((feel) => (
                  <P key={feel.id}>
                    <span className="flex flex-row items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ background: feel.color || undefined }}
                      />
                      {feel.label}
                    </span>
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
                {expandNotes ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </FlexList>
          </CardHeader>
          <CardContent>
            {expandNotes ? (
              splitNote.map((note, i) => <P key={i}>{note}</P>)
            ) : (
              <ScrollArea className="p-2 h-24">
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
            <FlexList items="start" gap={1}>
              {song.links.map((link) => (
                <Button
                  className="block w-full truncate"
                  asChild
                  variant="link"
                  size="sm"
                  key={link.id}
                >
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.href}
                  </a>
                </Button>
              ))}
            </FlexList>
          </CardContent>
        </Card>
      ) : null}

      {setlists?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Setlists featuring this song</CardTitle>
            <CardDescription>
              This song is featured in{" "}
              {pluralize("setlist", setlists.length, true)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <FlexList gap={2} pad={1}>
                {setlists.map((setlist) => (
                  <Link
                    to={`/${setlist.bandId}/setlists/${setlist.id}`}
                    key={setlist.id}
                  >
                    <SetlistContainer.Card>
                      <SetlistContainer.Setlist
                        setlist={{ ...setlist, notes: [] }}
                      />
                    </SetlistContainer.Card>
                  </Link>
                ))}
              </FlexList>
            </div>
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
      {!isSub ? (
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
      ) : null}
    </div>
  );
}

const DeleteSongDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="w-4 h-4 mr-2" />
          Delete Song
        </Button>
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
