import { faLink, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link, FlexList } from "~/components";

export default function NewBandOptions() {
  return (
    <FlexList direction="row" justify="center" pad={4}>
      <Link to="new" kind="primary" icon={faPlus}>Create new band</Link>
      <Link to="existing" kind="secondary" icon={faLink}>Add from exising</Link>
    </FlexList>
  )
}