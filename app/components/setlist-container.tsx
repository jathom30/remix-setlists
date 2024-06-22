import { Setlist, Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { Eye } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FlexList } from "./FlexList";
import { Large, Muted, P, Small } from "./typography";

export const SetlistContainer = ({
  setlist,
}: {
  setlist: SerializeFrom<
    Setlist & {
      sets: {
        updatedAt: string;
        songs: { song: { length: Song["length"] } | null }[];
      }[];
    }
  >;
}) => {
  return (
    <Card className="p-1 px-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Large>{setlist.name}</Large>
        <FlexList direction="row" items="center" gap={2}>
          <Muted>
            {setlist.sets.length} {setlist.sets.length === 1 ? "Set" : "Sets"}
          </Muted>
        </FlexList>
      </FlexList>
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Small>{new Date(setlist.updatedAt).toLocaleDateString()}</Small>
        <FlexList direction="row" gap={2} items="center">
          {setlist.isPublic ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Eye className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <P>This setlist is publically available to view</P>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </FlexList>
      </FlexList>
    </Card>
  );
};
