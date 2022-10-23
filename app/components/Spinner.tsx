import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Spinner = ({ invert = false }: { invert?: boolean }) => (
  <FontAwesomeIcon color={invert ? 'white' : undefined} icon={faSpinner} className="animate-spin" />
)