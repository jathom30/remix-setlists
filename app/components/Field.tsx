import type { ReactNode } from "react";
import { FlexList } from "./FlexList";
import { Label } from "./Label"

export const Field = ({ name, label, isRequired = false, children }: { name: string; label?: string; isRequired?: boolean; children?: ReactNode }) => {
  return (
    <label htmlFor={name} className="cursor-pointer w-full">
      <FlexList gap={0}>
        {label ? <Label required={isRequired}>{label}</Label> : null}
        {children}
      </FlexList>
    </label>
  )
}