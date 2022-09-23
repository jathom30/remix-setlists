import type { ReactNode } from "react"

export const RouteHeader = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-slate-400 h-14 flex flex-row p-2 items-center justify-between">
      {children}
    </div>
  )
}