import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const Loader = () => {
  return (
    <div className={`animate-spin text-base-content`}>
      <FontAwesomeIcon icon={faSpinner} />
    </div>
  )
}