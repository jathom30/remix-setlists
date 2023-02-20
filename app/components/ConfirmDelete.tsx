import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { useNavigation } from "@remix-run/react"
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { Link } from "./Link"
import { useSpinDelay } from 'spin-delay';

export const ConfirmDelete = ({ label, deleteLabel = 'Delete', message, cancelTo }: { label: string; deleteLabel?: string; message: string; cancelTo: string }) => {
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle')
  return (
    <FlexList pad="md">
      <h3 className="font-bold">{label}</h3>
      <p>{message}</p>
      <FlexList gap="sm" direction={{ none: 'col', sm: 'row-reverse' }}>
        <Button type="submit" kind="error" icon={faTrash} isSaving={isSubmitting}>{isSubmitting ? 'Deleting...' : deleteLabel}</Button>
        <Link to={cancelTo}>Cancel</Link>
      </FlexList>
    </FlexList>
  )
}