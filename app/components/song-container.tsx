import { Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { ChevronFirst, ChevronLast } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FlexList } from "./FlexList";
import { Large, Muted, P, Small } from "./typography";

export const SongContainer = ({ song }: { song: SerializeFrom<Song> }) => {
  const positionIcon =
    {
      opener: <ChevronFirst className="h-4 w-4" />,
      closer: <ChevronLast className="h-4 w-4" />,
    }[song.position] || null;
  const positionText =
    {
      opener: "Marked as opener",
      closer: "Marked as closer",
    }[song.position] || "";
  return (
    <Card className="p-1 px-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Large>{song.name}</Large>
        <FlexList direction="row" items="center" gap={2}>
          <Muted>{song.tempo} BPM</Muted>
          <Muted>{song.length} minutes</Muted>
        </FlexList>
      </FlexList>
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Small>{song.author}</Small>
        <FlexList direction="row" gap={2} items="center">
          {positionIcon ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>{positionIcon}</TooltipTrigger>
                <TooltipContent>
                  <P>{positionText}</P>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <Badge variant="outline">
            {song.keyLetter} {song.isMinor ? "Minor" : "Major"}
          </Badge>
        </FlexList>
      </FlexList>
    </Card>
  );
};
