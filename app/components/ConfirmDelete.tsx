import { faTrash } from "@fortawesome/free-solid-svg-icons"
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { Link } from "./Link"

export const ConfirmDelete = ({ label, message, cancelTo }: { label: string; message: string; cancelTo: string }) => {
  return (
    <FlexList pad={4}>
      <h3 className="font-bold">{label}</h3>
      <p className="text-xs text-text-subdued">{message}</p>
      <FlexList items="stretch" gap={2}>
        <Button type="submit" kind="danger" icon={faTrash}>Delete</Button>
        <Link to={cancelTo}>Cancel</Link>
      </FlexList>
    </FlexList>
  )
}