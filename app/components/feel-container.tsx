import pluralize from "pluralize";
import { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { TFeel } from "~/routes/$bandId.feels._index";

import { FlexList } from "./FlexList";
import { Large, Muted } from "./typography";

export const FeelContainer = ({ feel }: { feel: TFeel }) => {
  return (
    <div className="flex-grow">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <FlexList direction="row" items="center" gap={2}>
          <div
            className="w-4 h-4 rounded-full border"
            style={{ background: feel.color || undefined }}
          />
          <Large className="truncate max-w-[250px] sm:max-w-none">
            {feel.label}
          </Large>
        </FlexList>
        <FlexList direction="row" items="center" gap={2}>
          <Muted>{pluralize("song", feel.songs.length, true)}</Muted>
        </FlexList>
      </FlexList>
    </div>
  );
};

export const FeelContainerCard = ({ children }: { children: ReactNode }) => (
  <Card className="p-1 px-2 hover:outline">{children}</Card>
);

FeelContainer.Card = FeelContainerCard;
FeelContainer.Feel = FeelContainer;
