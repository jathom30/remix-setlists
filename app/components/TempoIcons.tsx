import { faBolt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FlexList } from "./FlexList"

export const TempoIcons = ({ tempo }: { tempo: number }) => {
  const color = () => {
    switch (tempo) {
      case 1:
        return 'text-info'
      case 2:
        return 'text-accent'
      case 3:
        return 'text-success'
      case 4:
        return 'text-warning'
      case 5:
        return 'text-error'
      default:
        return 'text-base-content'
    }
  }
  return (
    <FlexList direction="row" gap={0}>
      {Array.from({ length: 5 }, (_, i) => (
        <FontAwesomeIcon icon={faBolt} size="xs" key={i} className={i < tempo ? color() : 'text-base-300'} color={i < tempo ? 'black' : 'lightgrey'} />
      ))}
    </FlexList>
  )
}