import { Eye } from "lucide-react";
import pluralize from "pluralize";
import { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TSetlist } from "~/routes/$bandId.setlists._index";

import { FlexList } from "./FlexList";
import { Large, Muted, P, Small } from "./typography";

export const SetlistContainer = ({ setlist }: { setlist: TSetlist }) => {
  return (
    <div className="flex-grow">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Large className="truncate max-w-[250px] sm:max-w-none">
          {setlist.name}
        </Large>
        <FlexList direction="row" items="center" gap={2}>
          <Muted className="whitespace-nowrap">
            {pluralize("Set", setlist.sets.length, true)}
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
    </div>
  );
};

export const SetlistContainerCard = ({ children }: { children: ReactNode }) => (
  <Card className="p-1 px-2 hover:outline">{children}</Card>
);

SetlistContainer.Card = SetlistContainerCard;
SetlistContainer.Setlist = SetlistContainer;
