import { faSave } from "@fortawesome/free-solid-svg-icons"
import { useTransition } from "@remix-run/react"
import type { ReactNode } from "react"
import { Button } from "./Button"
import { Link } from "./Link"

export const SaveButtons = ({ saveLabel, cancelTo, isSaving = false }: { saveLabel: ReactNode; cancelTo: string; isSaving?: boolean }) => {
  const transition = useTransition()
  const isSubmitting = !!transition.submission
  return (
    <div className="flex flex-col p-4 gap-2 border-t border-slate-300 w-full bg-white sm:flex-row-reverse">
      <Button isSaving={isSubmitting || isSaving} icon={faSave} kind="primary" type="submit" isDisabled={isSaving}>{isSubmitting ? 'Saving...' : saveLabel}</Button>
      <Link to={cancelTo} type="submit">Cancel</Link>
    </div>
  )
}