import type { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Spinner = ({ invert = false, size }: { invert?: boolean; size?: SizeProp }) => (
  <FontAwesomeIcon color={invert ? 'white' : undefined} icon={faSpinner} size={size} className="animate-spin" />
)