import type { LegacyRef } from "react"

type InputProps = {
  name: string
  type?: React.InputHTMLAttributes<HTMLInputElement>['type']
  placeholder?: string
  defaultValue?: React.HTMLAttributes<HTMLInputElement>['defaultValue']
  onChange?: React.InputHTMLAttributes<HTMLInputElement>['onChange']
  inputRef?: LegacyRef<HTMLInputElement>
}

export const inputStyles = "w-full p-2 text-base rounded border-1 border-text-subdued relative bg-component-background text-text"

export const Input = ({ name, type = 'text', placeholder, defaultValue, onChange, inputRef }: InputProps) => {
  return (
    <input
      type={type}
      className={inputStyles}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
      ref={inputRef}
    />
  )
}