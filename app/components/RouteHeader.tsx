import { useNavigation } from "@remix-run/react"
import type { ReactNode } from "react"
import useSpinDelay from "spin-delay";
import { Spinner } from "./Spinner"

export const RouteHeader = ({ action, desktopAction, mobileChildren, desktopChildren }: { desktopAction?: ReactNode; mobileChildren?: ReactNode; desktopChildren?: ReactNode; action?: ReactNode }) => {
  const navigation = useNavigation()
  const isTransitioning = useSpinDelay(navigation.state !== 'idle')
  return (
    <>
      <div className="bg-slate-400 h-14 flex p-2 items-center justify-between w-full sm:hidden">
        <div className="flex items-center gap-4 w-full">
          {mobileChildren}
          {isTransitioning ? <Spinner invert /> : null}
        </div>
        {action}
      </div>
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:p-4 sm:border-b sm:border-slate-300">
        <div className="flex items-center gap-4">
          {desktopChildren}
          {isTransitioning ? <Spinner /> : null}
        </div>
        {desktopAction}
      </div>
    </>
  )
}