import { heatColors } from "~/utils/songConstants";
import { getCoords, getPointsWithCurve, svgHeight } from "~/utils/svg";

import { FlexList } from "./FlexList";
import { Small } from "./typography";

export const TempoWave = ({ tempos }: { tempos: number[] }) => {
  const width = 100;
  const curve = getPointsWithCurve(getCoords(tempos, width));
  const start = `M0 ${svgHeight}`;
  const end = `V ${svgHeight}`;

  const finalCurve = [start, ...curve, end, "z"].join(" ");

  return (
    <div className="TempoWave">
      {tempos.length <= 1 ? (
        <div className="TempoWave__empty">
          <FlexList pad={4} items="center" justify="center">
            <Small>At least two songs needed to generate tempo chart</Small>
          </FlexList>
        </div>
      ) : (
        <svg
          version="1.1"
          preserveAspectRatio="xMinYMin meet"
          viewBox={`0 0 ${width} ${svgHeight}`}
        >
          <defs>
            {/* <clipPath id="curve-cutout">
              <path d={finalCurve} />
            </clipPath> */}
            <linearGradient id="myGradient" gradientTransform="rotate(90)">
              {heatColors.map((color, i) => (
                <stop
                  key={color}
                  offset={`${(i / heatColors.length) * 100}%`}
                  stopColor={color}
                />
              ))}
              {/* <stop offset="5%" stopColor="gold" />
              <stop offset="50%" stopColor="red" /> */}
            </linearGradient>
          </defs>
          <path d={finalCurve} fill="url(#myGradient)" />
          {/* {heatColors.map((color, i) => (
            <rect
              key={color}
              x="0"
              y={`${(i / heatColors.length) * 100}%`}
              width={width}
              height={10}
              style={{ fill: color }}
              clipPath="url(#curve-cutout)"
            />
          ))} */}
        </svg>
      )}
    </div>
  );
};
