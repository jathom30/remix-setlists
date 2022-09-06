import { FlexList, Link } from "~/components";

export default function BandIndex() {
  return (
    <FlexList pad={4}>
      <p>{'<-'} Select a band</p>
      <p>or</p>
      <Link to="new">Create new</Link>
    </FlexList>
  )
}