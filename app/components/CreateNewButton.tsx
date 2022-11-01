import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"

export const CreateNewButton = ({ to }: { to: string }) => {
  return (
    <div className="sticky">
      <div className="absolute bottom-4 right-4">
        <Link to={to} className="flex items-center justify-center rounded-full w-16 bg-success text-white aspect-square">
          <FontAwesomeIcon size="2x" icon={faPlus} />
        </Link>
      </div>
    </div>
  )
}