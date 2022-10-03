import { FlexList } from "./FlexList"

export const Checkbox = ({ name, label }: { name: string; label: string }) => {
  return (
    <label id={name} className="hover:bg-slate-100 p-2 rounded">
      <FlexList direction="row" gap={2}>
        <input type="checkbox" name={name} />
        <span className="text-sm">{label}</span>
      </FlexList>
    </label>
  )
}