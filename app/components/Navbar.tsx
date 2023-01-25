import type { ReactNode } from "react"

export const Navbar = ({ children, shrink = false }: { children: ReactNode; shrink?: boolean }) => {
  return (
    <div className={`navbar bg-base-100 shadow-lg border-b border-base-300 ${shrink ? 'min-h-[2.5rem] py-1' : ''}`}>{children}</div>
  )
}