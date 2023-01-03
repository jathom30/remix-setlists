import type { ReactNode } from "react"

export const Badge = ({ children, size = 'md' }: {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}) => {
  return (
    <span className={`badge ${size ? `badge-${size}` : ''}`}>{children}</span>
  )
}