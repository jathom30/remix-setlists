import { Link, useParams } from "@remix-run/react";
import { Maximize, Minimize, Pencil } from "lucide-react";
import pluralize from "pluralize";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TSong } from "~/utils/dnd";

import { FlexList } from "../FlexList";
import { MaxWidth } from "../MaxWidth";
import { H1, P } from "../typography";

export const SongDetailsSheet = ({
  song,
  open,
  onOpenChange,
}: {
  song: TSong;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { setlistId } = useParams();
  const [expandNotes, setExpandNotes] = useState(false);

  const splitNote = song.note?.split("\n");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <MaxWidth>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            <div className="sticky top-0 bg-card p-2 pt-4">
              <FlexList direction="row" justify="between" items="center">
                <H1>Song Details</H1>
                <Button asChild>
                  <Link
                    to={{
                      pathname: `/${song.bandId}/songs/${song.id}/edit`,
                      search: `?redirectTo=${`/${song.bandId}/setlists/${setlistId}`}`,
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Song
                  </Link>
                </Button>
              </FlexList>
            </div>
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
                    <P>{song.tempo} BPM</P>
                  </div>
                </div>
                {song.feels?.length ? (
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
                        expandNotes
                          ? "Collapse note section"
                          : "Expand note section"
                      }
                    >
                      {expandNotes ? (
                        <Maximize className="w-4 h-4" />
                      ) : (
                        <Minimize className="w-4 h-4" />
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
                  <FlexList gap={1} items="start">
                    {song.links.map((link) => (
                      <Button
                        className="block w-full truncate"
                        asChild
                        variant="link"
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
          </div>
        </MaxWidth>
      </SheetContent>
    </Sheet>
  );
};
