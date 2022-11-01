import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const Loader = ({ invert = false }: { invert?: boolean }) => {
  return (
    <div className={`animate-spin ${invert ? 'text-white' : ''}`}>
      <FontAwesomeIcon icon={faSpinner} />
    </div>
  )
}