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

          <defs>
            <clipPath id="curve-cutout">
              <path d={finalCurve} />
            </clipPath>
          </defs>
          {heatColors.map((color, i) => (
            <rect key={color} x="0" y={`${i / heatColors.length * 100}%`} width={width} height={10} style={{ fill: color }} clipPath="url(#curve-cutout" />
          ))}
        </svg>
      )}
    </div>
  )
}