import { faBolt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FlexList } from "./FlexList"

export const TempoIcons = ({ tempo }: { tempo: number }) => {
  return (
    <FlexList direction="row" gap={2}>
      {Array.from({ length: 5 }, (_, i) => (
        <FontAwesomeIcon icon={faBolt} key={i} color={i < tempo ? 'black' : 'lightgrey'} />
      ))}
    </FlexList>
  )
}