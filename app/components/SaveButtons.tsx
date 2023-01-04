import { faSave } from "@fortawesome/free-solid-svg-icons"
import { useTransition } from "@remix-run/react"
import type { ReactNode } from "react"
import { Button } from "./Button"
import { Divider } from "./Divider"
import { Link } from "./Link"

export const SaveButtons = ({ saveLabel, cancelTo, isSaving = false, isDisabled = false }: { saveLabel: ReactNode; cancelTo: string; isSaving?: boolean; isDisabled?: boolean }) => {
  const transition = useTransition()
  const isSubmitting = !!transition.submission
  return (
    <div className="bg-base-100">
      <div className="px-4">
        <Divider />
      </div>
      <div className="flex flex-col p-4 pt-0 gap-2 w-full sm:flex-row-reverse">
        <Button isSaving={isSubmitting || isSaving} icon={faSave} kind="primary" type="submit" isDisabled={isDisabled || isSaving}>{isSubmitting ? 'Saving...' : saveLabel}</Button>
        <Link to={cancelTo} type="submit">Cancel</Link>
      </div>
    </div>
  )
}