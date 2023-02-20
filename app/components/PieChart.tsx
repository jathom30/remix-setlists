import type { Feel } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { createPaths } from "~/utils/svg";
import { FeelTag } from "./FeelTag";
import { FlexList } from "./FlexList";

export const PieChart = ({ slices, noFeel }: { slices: { percent: number; feel: SerializeFrom<Feel | null> }[]; noFeel?: number }) => {
  const paths = createPaths(slices)
  return (
    <div className="grid grid-cols-2 gap-4 grid-rows-1">
      <div className="w-full h-full -rotate-90 origin-center flex">
        <svg version="1.1" preserveAspectRatio="xMinYMin meet" viewBox="-1 -1 2 2" className="w-full h-full">
          {paths.map(path => (
            <path key={path.pathData} d={path.pathData} fill={path.feel?.color || 'white'} />
          ))}
        </svg>
      </div>
      <FlexList gap="sm">
        {slices.map(slice => {
          if (!slice.feel) { return null }
          return (
            <FeelTag fullWidth feel={slice.feel} key={slice.feel.id}>{Math.round(slice.percent * 100)}%</FeelTag>
          )
        })}
        {noFeel ? (
          <FlexList direction="row" gap="sm" justify="center">
            Songs without feels
            <span>{Math.round(noFeel * 100)}%</span>
          </FlexList>
        ) : null}
      </FlexList>
    </div>
  )
}