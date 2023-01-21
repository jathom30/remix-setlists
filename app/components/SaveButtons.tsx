import { faSave } from "@fortawesome/free-solid-svg-icons"
import { useTransition } from "@remix-run/react"
import type { ReactNode } from "react"
import { useSpinDelay } from "spin-delay"
import { Button } from "./Button"
// import { Link } from "./Link"

export const SaveButtons = ({ saveLabel, cancelTo, isSaving = false, isDisabled = false }: { saveLabel: ReactNode; cancelTo: string; isSaving?: boolean; isDisabled?: boolean }) => {
  const transition = useTransition()
  const isSubmitting = useSpinDelay(transition.state !== 'idle')
  return (
    <div className="bg-base-100 shadow-2xl flex flex-col p-4 gap-2 w-full sm:flex-row-reverse xl:rounded-md">
      <Button isSaving={isSubmitting || isSaving} icon={faSave} kind="primary" type="submit" isDisabled={isDisabled || isSaving}>{isSubmitting ? 'Saving...' : saveLabel}</Button>
      {/* <Link to={cancelTo} type="submit">Cancel</Link> */}
    </div>
  )
}