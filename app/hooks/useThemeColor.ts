import { useEffect, useState } from "react";

import { getColor } from "~/utils/tailwindColors";

type ThemeColor =
  | "primary"
  | "secondary"
  | "accent"
  | "base-100"
  | "info"
  | "neutral"
  | "success"
  | "warning"
  | "error";

export const useThemeColor = (themeColor: ThemeColor) => {
  const [convertedColor, setConvertedColor] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const accent = getColor(themeColor);
    const colorVar = accent.replace("hsl(var(", "").split(")")[0];
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      colorVar,
    );
    setConvertedColor(`hsl(${color})`);
  }, [themeColor]);

  return convertedColor;
};
