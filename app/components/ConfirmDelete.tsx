import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { useTransition } from "@remix-run/react"
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { Link } from "./Link"
import { useSpinDelay } from 'spin-delay';

export const ConfirmDelete = ({ label, deleteLabel = 'Delete', message, cancelTo }: { label: string; deleteLabel?: string; message: string; cancelTo: string }) => {
  const transition = useTransition()
  const isSubmitting = useSpinDelay(!!transition.submission)
  return (
    <FlexList pad={4}>
      <h3 className="font-bold">{label}</h3>
      <p>{message}</p>
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" kind="error" icon={faTrash} isSaving={isSubmitting}>{isSubmitting ? 'Deleting...' : deleteLabel}</Button>
        <Link to={cancelTo}>Cancel</Link>
      </div>
    </FlexList>
  )
}