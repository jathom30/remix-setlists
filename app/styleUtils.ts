import type { ButtonKind } from "~/components"

export const defaultButtonStyles = "flex items-center gap-2 rounded justify-center font-bold py-2 px-4 h-8 border-0 bg-component-background-alt text-sm text-text-subdued transition-all hover:bg-component-background-darken"

export const additionalStyles = ({ isDisabled, kind }: { isDisabled: boolean, kind: ButtonKind }) => {
  if (isDisabled) {
    return 'text-white bg-component-background-alt pointer-events-none'
  }
  switch (kind) {
    case 'primary':
      return "bg-primary text-white hover:bg-primary-darken"
    case 'secondary':
      return "bg-transparent text-secondary hover:bg-secondary hover:text-white"
    case 'danger':
      return 'text-danger bg-transparent border border-danger hover:text-white hover:bg-danger'
    case 'text':
      return 'text-text-subdued bg-transparent hover:bg-background-alt'
    case 'invert':
      return 'text-white bg-transparent hover:bg-white hover:text-text'
    default:
      return ''
  }
}