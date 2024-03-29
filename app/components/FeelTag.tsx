import type { Feel } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import type { ReactNode } from "react";

import { contrastColor } from "~/utils/assorted";

export const FeelTag = ({
  feel,
  children,
  fullWidth = false,
}: {
  feel: Pick<SerializeFrom<Feel>, "color" | "label">;
  children?: ReactNode;
  fullWidth?: boolean;
}) => {
  return (
    <span
      className={`badge badge-lg border-none whitespace-nowrap ${
        fullWidth ? "w-full" : ""
      }`}
      style={{
        backgroundColor: feel.color || "",
        color: contrastColor(feel.color || ""),
      }}
    >
      {feel.label} {children}
    </span>
  );
};
