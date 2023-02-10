import type { BadgeKind, ButtonKind, ButtonProps } from "~/components";

export const buttonKind = (kind?: ButtonKind) => {
  switch (kind) {
    case 'accent':
      return 'btn-accent'
    case 'active':
      return 'btn-active'
    case 'disabled':
      return 'btn-disabled'
    case 'error':
      return 'btn-error'
    case 'ghost':
      return 'btn-ghost'
    case 'info':
      return 'btn-info'
    case 'link':
      return 'btn-link'
    case 'outline':
      return 'btn-outline'
    case 'primary':
      return 'btn-primary'
    case 'secondary':
      return 'btn-secondary'
    case 'success':
      return 'btn-success'
    case 'warning':
      return 'btn-warning'
    default:
      return ''
  }
}

export const buttonSize = (size?: ButtonProps['size']) => {
  switch (size) {
    case 'xs':
      return 'btn-xs'
    case 'sm':
      return 'btn-sm'
    case 'md':
      return 'btn-md'
    case 'lg':
      return 'btn-lg'
    default:
      return null
  }
}

export const badgeKind = (kind?: BadgeKind) => {
  switch (kind) {
    case 'accent':
      return 'badge-accent'
    case 'error':
      return 'badge-error'
    case 'ghost':
      return 'badge-ghost'
    case 'info':
      return 'badge-info'
    case 'outline':
      return 'badge-outline'
    case 'primary':
      return 'badge-primary'
    case 'secondary':
      return 'badge-secondary'
    case 'success':
      return 'badge-success'
    case 'warning':
      return 'badge-warning'
    default:
      return ''
  }
}