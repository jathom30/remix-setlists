import { useParams } from "@remix-run/react";
import { FlexList, Link } from "~/components";

export default function CreateNewSelection() {
  const { bandId } = useParams()
  return (
    <FlexList pad={4}>
      <Link to={`/${bandId}/setlists/new`}>Create setlist</Link>
      <Link to={`/${bandId}/songs/new`}>Create song</Link>
    </FlexList>
  )
}