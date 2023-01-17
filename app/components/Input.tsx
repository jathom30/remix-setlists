import type { LegacyRef } from "react"

type InputProps = {
  name: string
  type?: React.InputHTMLAttributes<HTMLInputElement>['type']
  placeholder?: string
  defaultValue?: React.HTMLAttributes<HTMLInputElement>['defaultValue']
  onChange?: React.InputHTMLAttributes<HTMLInputElement>['onChange']
  inputRef?: LegacyRef<HTMLInputElement>
  isDisabled?: boolean
  value?: string
}

export const inputStyles = "w-full p-2 text-base rounded border-1 border-text-subdued relative bg-component-background text-text"

export const Input = ({ name, type = 'text', value, placeholder, defaultValue, onChange, inputRef, isDisabled = false }: InputProps) => {
  return (
    <input
      type={type}
      className="input input-bordered w-full max-w-sx"
      name={name}
      value={value}
      placeholder={placeholder}
      defaultValue={defaultValue}
      disabled={isDisabled}
      onChange={onChange}
      ref={inputRef}
    />
  )
}