import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"

export const CreateNewButton = ({ to, icon = faPlus, ariaLabel }: { to: string, icon?: IconDefinition; ariaLabel?: string }) => {
  return (
    <div className="sticky sm:hidden">
      <div className="absolute bottom-4 right-4">
        <Link
          to={to}
          className="btn btn-circle btn-lg btn-primary"
          aria-label={ariaLabel}
        >
          <FontAwesomeIcon size="2x" icon={icon} />
        </Link>
      </div>
    </div>
  )
}