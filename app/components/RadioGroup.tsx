import { Field } from "./Field";
import { FlexList } from "./FlexList";

export const RadioGroup = ({ options, name, direction = 'row', gap, isChecked }: { options: { label: string, value: string }[]; name: string; direction?: 'row' | 'col'; gap?: number; isChecked: (value: string) => boolean }) => {
  return (
    <FlexList direction={direction} gap={gap}>
      {options.map(option => (
        <div key={option.label} className="p-2 rounded-full hover:bg-base-200">
          <Field name={option.value}>
            <FlexList direction="row" gap={2} items="center">
              <input className="radio" name={name} id={option.value} type="radio" value={option.value} defaultChecked={isChecked(option.value)} />
              <span className="text-sm">{option.label}</span>
            </FlexList>
          </Field>
        </div>
      ))}
    </FlexList>
  )
}