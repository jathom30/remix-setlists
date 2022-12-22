import type { ChangeEvent, ReactNode } from "react";
import { FlexList } from "./FlexList"

export const Checkbox = ({ name, label, value, defaultChecked, onChange }: { name: string; label: ReactNode; value?: string, defaultChecked?: boolean; onChange?: (e: ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <label id={name} className="hover:bg-slate-100 p-2 rounded">
      <FlexList direction="row" gap={2}>
        <input onChange={onChange} type="checkbox" name={name} value={value} defaultChecked={defaultChecked} />
        <span className="text-sm">{label}</span>
      </FlexList>
    </label>
  )
}