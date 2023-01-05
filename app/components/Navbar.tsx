import type { ReactNode } from "react"

export const Navbar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="navbar bg-base-100 shadow-lg">{children}</div>
  )
}