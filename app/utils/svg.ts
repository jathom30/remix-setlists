import type { Feel, Song } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";

const getY = (tempo: number) => {
  // scale is based on 13 high svg
  // TODO should make this more responsive
  switch (tempo) {
    case 1:
      return 12;
    case 2:
      return 9;
    case 3:
      return 6;
    case 4:
      return 3;
    case 5:
      return 1;
    default:
      return 13;
  }
};
const getX = (index: number, numberOfPoints: number, width: number) => {
  return (width / numberOfPoints) * index;
};
export const getCoords = (tempos: Song["tempo"][], width: number) =>
  tempos.map((tempo, i) => {
    return {
      x: getX(i, tempos.length - 1, width),
      y: getY(tempo || 0),
    };
  });

export const getPointsWithCurve = (coords: { x: number; y: number }[]) =>
  coords.map((coord, i) => {
    if (i === 0) {
      return `L ${coord?.x || 0} ${coord.y}`;
    }
    // bezier curve X should be halfway betweet points
    const curveX = (coord.x + coords[i - 1].x) / 2;
    // y1 is the prev point's y
    const y1 = coords[i - 1].y;
    // y2 is current point's y
    const y2 = coord.y;
    // C = bezier curve
    return `C ${curveX} ${y1}, ${curveX} ${y2} ${coord.x} ${coord.y}`;
  });

function getCoordinatesForPercent(percent: number) {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
}

export const createPaths = (
  slices: {
    percent: number;
    feel: Pick<SerializeFrom<Feel>, "color" | "label">;
  }[],
) => {
  let cumulativePercent = 0;
  return slices.map((slice) => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += slice.percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = slice.percent > 0.5 ? 1 : 0;
    const pathData = [
      `M ${startX} ${startY}`, // Move
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
      `L 0 0 z`, // Line
    ].join(" ");
    return { pathData, feel: slice.feel, percent: slice.percent * 100 };
  });
};
