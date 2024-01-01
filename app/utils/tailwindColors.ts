import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

const theme = fullConfig.theme;
export const getColor = (name: string, opactity?: number): string => {
  if (!theme) return "black";
  if (!("colors" in theme)) return "black";
  const colors = theme.colors as Record<
    string,
    | string
    | Record<number, string>
    | (({ opacityValue }: { opacityValue: number }) => string)
  >;
  if (!(name in colors)) return "black";
  const color = colors[name];
  if (typeof color === "string") return color;
  if (typeof color === "function")
    return color({ opacityValue: opactity ?? 1 });
  if (typeof color === "object") {
    if (!opactity) return color[500];
    if (!(opactity in color)) return "black";
    return color[opactity];
  }
  return "black";
};
