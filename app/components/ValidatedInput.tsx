import { Label } from "./Label"
import { useField } from 'remix-validated-form'
import { inputStyles } from "./Input";

export const ValidatedInput = ({ name, label, isRequired = false }: { name: string; label: string; isRequired?: boolean }) => {
  const { error, getInputProps } = useField(name)
  return (
    <label htmlFor={name}>
      <Label required={isRequired}>{label}</Label>
      <input className={inputStyles} {...getInputProps({ id: name })} />
      {error ? (
        <span>{error}</span>
      ) : null}
    </label>
  )
}