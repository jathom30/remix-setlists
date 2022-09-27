import { FlexList, Link } from "~/components";

export default function CreateBandMenu() {
  return (
    <FlexList pad={4}>
      <Link to="/bandSelect/existing">Add with code</Link>
      <Link to="/bandSelect/new">Create a new band</Link>
    </FlexList>
  )
}