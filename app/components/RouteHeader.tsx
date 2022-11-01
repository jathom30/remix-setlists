import { useTransition } from "@remix-run/react"
import type { ReactNode } from "react"
import { Spinner } from "./Spinner"

export const RouteHeader = ({ children, action }: { children: ReactNode; action?: ReactNode }) => {
  const transition = useTransition()
  const isTransitioning = !!transition.submission
  return (
    <div className="bg-slate-400 h-14 flex p-2 items-center justify-between w-full sm:hidden">
      <div className="flex items-center gap-4 w-full">
        {children}
        {isTransitioning ? <Spinner invert /> : null}
      </div>
      {action}
    </div>
  )
}