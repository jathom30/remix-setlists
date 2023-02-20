import type { ReactNode } from "react"
import { badgeKind } from "~/utils/buttonStyles";
import type { Size } from "~/utils/flexStyles";

export type BadgeKind = 'outline' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error'

export const Badge = ({ children, size = 'md', kind }: {
  children: ReactNode;
  size?: Size;
  kind?: BadgeKind
}) => {
  return (
    <span className={`badge ${badgeKind(kind)} ${getSize(size)}`}>{children}</span>
  )
}

const getSize = (size: Size) => {
  switch (size) {
    case 'xs':
      return 'badge-xs'
    case 'sm':
      return 'badge-sm'
    case 'md':
      return 'badge-md'
    case 'lg':
      return 'badge-lg'
    default:
      return ''
  }
}