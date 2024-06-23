import { Feel } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { ReactNode } from "react";

import { Card } from "@/components/ui/card";

import { FlexList } from "./FlexList";
import { Large, Muted } from "./typography";

export const FeelContainer = ({
  feel,
}: {
  feel: SerializeFrom<Feel & { songs: { id: string }[] }>;
}) => {
  return (
    <div className="flex-grow">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <FlexList direction="row" items="center" gap={2}>
          <div
            className="w-4 h-4 rounded-full border"
            style={{ background: feel.color || undefined }}
          />
          <Large>{feel.label}</Large>
        </FlexList>
        <FlexList direction="row" items="center" gap={2}>
          <Muted>
            {feel.songs.length} {feel.songs.length === 1 ? "song" : "songs"}
          </Muted>
        </FlexList>
      </FlexList>
    </div>
  );
};

export const FeelContainerCard = ({ children }: { children: ReactNode }) => (
  <Card className="p-1 px-2">{children}</Card>
);

FeelContainer.Card = FeelContainerCard;
FeelContainer.Feel = FeelContainer;
