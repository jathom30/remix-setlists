import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FlexList, Link } from "~/components";

export default function CreateBandMenu() {
  return (
    <FlexList pad={4}>
      <p>How do you want to add a band?</p>
      <Link to="/bandSelect/existing">Add with code</Link>
      <Link to="/bandSelect/new" icon={faPlus}>Create a new band</Link>
    </FlexList>
  )
}