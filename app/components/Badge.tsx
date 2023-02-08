import type { ReactNode } from "react"
import { badgeKind } from "~/utils/buttonStyles";

export type BadgeKind = 'outline' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error'

export const Badge = ({ children, size = 'md', kind }: {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  kind?: BadgeKind
}) => {
  return (
    <span className={`badge ${badgeKind(kind)} ${getSize(size)}`}>{children}</span>
  )
}

const getSize = (size: 'xs' | 'sm' | 'md' | 'lg') => {
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