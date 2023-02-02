import { heatColors } from "~/utils/songConstants"
import { getCoords, getPointsWithCurve } from "~/utils/svg"
import { FlexList } from "./FlexList"


export const TempoWave = ({ tempos }: { tempos: number[] }) => {

  const height = 13
  const width = 100
  const curve = getPointsWithCurve(getCoords(tempos, width))
  const start = `M0 ${height}`
  const end = `V ${height}`

  const finalCurve = [start, ...curve, end, 'z'].join(' ')

  return (
    <div className="TempoWave">
      {tempos.length <= 1 ? (
        <div className="TempoWave__empty">
          <FlexList pad={4} items="center" justify="center">
            Add at least two songs to see setlist heatmap
          </FlexList>
        </div>
      ) : (
        <svg version="1.1" preserveAspectRatio="xMinYMin meet" viewBox={`0 0 ${width} ${height}`}>
          <linearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
            {heatColors.map((color, i) => (
              <stop key={color} offset={`${i / heatColors.length * 100}%`} style={{ stopColor: color, stopOpacity: 1 }} />
            ))}
          </linearGradient>
          <path d={finalCurve} stroke="#FFFFFF" fill="url(#grad)" />
        </svg>
      )}
    </div>
  )
}