import { Field } from "./Field";
import { FlexList } from "./FlexList";

export const RadioGroup = ({ options, name, isChecked }: { options: { label: string, value: string }[]; name: string; isChecked: (value: string) => boolean }) => {
  return (
    <FlexList direction="row">
      {options.map(option => (
        <div key={option.label} className="p-2 rounded hover:bg-slate-100">
          <Field name={option.value}>
            <FlexList direction="row" gap={2}>
              <input name={name} id={option.value} type="radio" value={option.value} defaultChecked={isChecked(option.value)} />
              <span className="text-sm">{option.label}</span>
            </FlexList>
          </Field>
        </div>
      ))}
    </FlexList>
  )
}