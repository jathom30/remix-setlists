import type { Feel } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { createPaths } from "~/utils/svg";
import { FeelTag } from "./FeelTag";
import { FlexList } from "./FlexList";

export const PieChart = ({ slices }: { slices: { percent: number; feel: SerializeFrom<Feel | null> }[] }) => {
  const paths = createPaths(slices)
  return (
    <FlexList direction="row">
      <svg version="1.1" preserveAspectRatio="xMinYMin meet" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
        {paths.map(path => (
          <path key={path.pathData} d={path.pathData} fill={path.feel?.color || 'white'} />
        ))}
      </svg>
      <FlexList>
        {slices.map(slice => {
          if (!slice.feel) { return null }
          return (
            <FeelTag feel={slice.feel} key={slice.feel.id}>{Math.round(slice.percent * 100)}%</FeelTag>
          )
        })}
      </FlexList>
    </FlexList>
  )
}