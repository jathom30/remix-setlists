import type { Feel } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { createPaths } from "~/utils/svg";
import { FeelTag } from "./FeelTag";
import { FlexList } from "./FlexList";

export const PieChart = ({ slices, noFeel }: { slices: { percent: number; feel: SerializeFrom<Feel | null> }[]; noFeel?: number }) => {
  const paths = createPaths(slices)
  return (
    <div className="grid grid-cols-2 gap-4">
      <svg version="1.1" preserveAspectRatio="xMinYMin meet" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="h-full w-full">
        {paths.map(path => (
          <path key={path.pathData} d={path.pathData} fill={path.feel?.color || 'white'} />
        ))}
      </svg>
      <FlexList gap={2}>
        {slices.map(slice => {
          if (!slice.feel) { return null }
          return (
            <FeelTag fullWidth feel={slice.feel} key={slice.feel.id}>{Math.round(slice.percent * 100)}%</FeelTag>
          )
        })}
        {noFeel ? (
          <FlexList direction="row" gap={2} justify="center">
            Songs without feels
            <span>{Math.round(noFeel * 100)}%</span>
          </FlexList>
        ) : null}
      </FlexList>
    </div>
  )
}