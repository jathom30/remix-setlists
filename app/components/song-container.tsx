import { Feel, Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { ChevronFirst, ChevronLast } from "lucide-react";
import pluralize from "pluralize";
import { ReactNode } from "react";

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

export const SongContainer = ({
  song,
}: {
  song: SerializeFrom<Song & { feels: Feel[] }>;
}) => {
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
    <div className="flex-grow">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Large className="truncate max-w-[200px] sm:max-w-none">
          {song.name}
        </Large>
        <FlexList direction="row" items="center" gap={2}>
          {song.tempo ? (
            <Muted className="whitespace-nowrap">{song.tempo} BPM</Muted>
          ) : null}
          <Muted className="whitespace-nowrap">
            {pluralize("min", song.length, true)}
          </Muted>
        </FlexList>
      </FlexList>
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Small className="truncate max-w-[200px] sm:max-w-none">
          {song.author}
        </Small>
        <FlexList direction="row" gap={2} items="center">
          {song?.feels?.map((feel) => (
            <TooltipProvider key={feel.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ background: feel.color || "" }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <P>{feel.label}</P>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
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
          <Badge className="whitespace-nowrap" variant="outline">
            {song.keyLetter} {song.isMinor ? "Minor" : "Major"}
          </Badge>
        </FlexList>
      </FlexList>
    </div>
  );
};

export const SongContainerCard = ({ children }: { children: ReactNode }) => (
  <Card className="p-1 px-2 overflow-x-auto hover:outline">{children}</Card>
);

SongContainer.Card = SongContainerCard;
SongContainer.Song = SongContainer;
