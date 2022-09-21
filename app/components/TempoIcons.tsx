import { faBolt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FlexList } from "./FlexList"

export const TempoIcons = ({ tempo }: { tempo: number }) => {
  return (
    <FlexList direction="row" gap={0}>
      {Array.from({ length: 5 }, (_, i) => (
        <FontAwesomeIcon icon={faBolt} size="xs" key={i} color={i < tempo ? 'black' : 'lightgrey'} />
      ))}
    </FlexList>
  )
}