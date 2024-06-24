import type { Feel } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";

import { Badge } from "@/components/ui/badge";
import { contrastColor } from "~/utils/assorted";
import { createPaths } from "~/utils/svg";

import { FlexList } from "./FlexList";

export const PieChart = ({
  slices,
  noFeel,
}: {
  slices: {
    percent: number;
    feel: Pick<SerializeFrom<Feel>, "color" | "label">;
  }[];
  noFeel?: number;
}) => {
  const paths = createPaths(slices);
  return (
    <div className="grid grid-cols-2 gap-4 grid-rows-1">
      <svg
        version="1.1"
        preserveAspectRatio="xMinYMin meet"
        viewBox="-1 -1 2 2"
        className="w-full h-auto aspect-square -rotate-90 border rounded-full"
      >
        {paths.map((path) => (
          <path
            key={path.pathData}
            d={path.pathData}
            fill={path.feel?.color || "white"}
          />
        ))}
      </svg>
      <FlexList gap={2}>
        {slices.map((slice) => {
          if (!slice.feel) {
            return null;
          }
          return (
            <Badge
              style={{
                background: slice.feel.color || "",
                color: contrastColor(slice.feel.color || ""),
              }}
              key={slice.feel.label}
            >
              {Math.round(slice.percent * 100)}% {slice.feel.label}
            </Badge>
          );
        })}
        {noFeel ? (
          <Badge variant="outline">
            {Math.round(noFeel * 100)}% Songs without feels
          </Badge>
        ) : null}
      </FlexList>
    </div>
  );
};
