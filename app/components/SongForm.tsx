import Select from "react-select"
import { useControlField, useField } from "remix-validated-form"
import { capitalizeFirstLetter } from "~/utils/assorted"
import { feels, keyLetters, majorMinorOptions } from "~/utils/songConstants"
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { ItemBox } from "./ItemBox"
import { Label } from "./Label"
import { ValidatedInput } from "./ValidatedInput"

export const SongForm = () => {
  return (
    <FlexList>
      <Label>Details</Label>
      <ItemBox>
        <FlexList>
          <ValidatedInput name="name" label="Name" />

          <FlexList gap={2}>
            <Label>Key</Label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <ControlledSelect
                name="keyLetter"
                options={keyLetters.map(letter => ({ value: letter, label: letter }))}
              />
              <ControlledSelect
                name="isMinor"
                options={majorMinorOptions}
                booleanLabels={['Major', 'Minor']}
              />
            </div>
          </FlexList>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <FlexList gap={2}>
              <Label>Tempo</Label>
            </FlexList>
            <FlexList gap={2}>
              <Label>Feel</Label>
              <Select
                isMulti
                name="feels"
                options={feels.map(feel => ({ label: capitalizeFirstLetter(feel), value: feel }))}
              />
            </FlexList>
          </div>

        </FlexList>
      </ItemBox>
      <Label>Note</Label>
      <ItemBox>
        <FlexList>
          <Button>Add note</Button>
        </FlexList>
      </ItemBox>
    </FlexList>
  )
}

type ControlledSelectProps = {
  name: string;
  label?: string;
  options: { value: string | boolean, label: string }[]
  booleanLabels?: [string, string]
}
const ControlledSelect = <V,>({ name, label, options, booleanLabels = ['', ''] }: ControlledSelectProps) => {
  const { error } = useField(name)
  const [value, setValue] = useControlField<typeof options[0]['value'] | undefined>(name)
  return (
    <label htmlFor={name}>
      {label ? <Label>{label}</Label> : null}
      {typeof value === 'boolean' ? (
        <input
          hidden
          name={name}
          checked={value}
        />
      ) : null}
      {typeof value === 'string' ? (
        <input
          hidden
          name={name}
          value={value}
        />
      ) : null}
      <Select
        instanceId={name}
        name={name}
        value={value !== undefined ? { value, label: typeof value === 'boolean' ? value ? booleanLabels[0] : booleanLabels[1] : value } : undefined}
        onChange={option => {
          if (!option) return
          setValue(option.value)
        }}
        options={options}
      />
      {error ? <span>{error}</span> : null}
    </label>
  )
}