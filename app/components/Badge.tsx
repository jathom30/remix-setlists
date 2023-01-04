import type { ReactNode } from "react"
import { badgeKind } from "~/utils/buttonStyles";

export type BadgeKind = 'outline' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error'

export const Badge = ({ children, size = 'md', kind }: {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  kind?: BadgeKind
}) => {
  return (
    <span className={`badge ${badgeKind(kind)} ${size ? `badge-${size}` : ''}`}>{children}</span>
  )
}