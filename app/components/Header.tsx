import type { ReactNode } from "react"

export const Header = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center justify-between">{children}</div>
  )
}