import type { Feel } from "@prisma/client"
import type { SerializeFrom } from '@remix-run/node'
import type { ReactNode } from "react";
import { contrastColor } from "~/utils/assorted"

export const FeelTag = ({ feel, children }: { feel: SerializeFrom<Feel>; children?: ReactNode }) => {
  return (
    <span className="py-1 px-3 text-sm rounded" style={{ backgroundColor: feel.color || '', color: contrastColor(feel.color || '') }}>{feel.label} {children}</span>
  )
}