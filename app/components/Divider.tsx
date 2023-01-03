import type { ReactNode } from "react"

export const Divider = ({ children, direction = 'vertical' }: { children?: ReactNode; direction?: 'vertical' | 'horizontal' }) => {
  return (
    <div className={`divider divider-${direction}`}>{children}</div>
  )
}