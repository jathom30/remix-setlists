import type { ReactNode } from "react";
import { FlexList } from "./FlexList";
import { Label } from "./Label"

export const Field = ({ name, label, isRequired = false, children }: { name: string; label?: string; isRequired?: boolean; children?: ReactNode }) => {
  return (
    <label htmlFor={name}>
      <FlexList gap={2}>
        {label ? <Label required={isRequired}>{label}</Label> : null}
        {children}
      </FlexList>
    </label>
  )
}