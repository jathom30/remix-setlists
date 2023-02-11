import type { ChangeEvent, ReactNode } from "react";
import { FlexList } from "./FlexList"

export const Checkbox = ({ name, label, value, defaultChecked, checked, onChange }: { name: string; label: ReactNode; value?: string, checked?: boolean; defaultChecked?: boolean; onChange?: (e: ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <label id={name} className="cursor-pointer hover:bg-base-200 p-2 rounded-lg">
      <FlexList direction="row" gap={2} items="center">
        <input onChange={onChange} className="checkbox" type="checkbox" name={name} value={value} checked={checked} defaultChecked={defaultChecked} />
        <span className="text-sm">{label}</span>
      </FlexList>
    </label>
  )
}