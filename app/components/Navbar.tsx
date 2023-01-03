import type { ReactNode } from "react"

export const Navbar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="navbar bg-neutral">{children}</div>
  )
}