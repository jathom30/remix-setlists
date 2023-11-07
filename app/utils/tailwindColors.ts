import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

const colors = fullConfig.theme?.colors as unknown as Record<
  string,
  ({ opacityValue }: { opacityValue: number }) => string
>;

export const getColor = (name: string, opactity?: number) =>
  colors?.[name]({ opacityValue: opactity ?? 1 });
