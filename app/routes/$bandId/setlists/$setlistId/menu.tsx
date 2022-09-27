import { useParams } from "@remix-run/react";
import { FlexList, Link } from "~/components";

export default function SetlistMenu() {
  const { bandId, setlistId } = useParams()
  return (
    <FlexList pad={4} gap={2}>
      <Link to={`/${bandId}/setlists/${setlistId}/rename`} kind="text">Rename setlist</Link>
      <Link to={`/${bandId}/setlists/edit/${setlistId}`} kind="text">Edit setlist</Link>
      <Link to={`/${bandId}/setlists/condensed/${setlistId}`} kind="text">Condensed view</Link>
      <Link to={`/${bandId}/setlists/data/${setlistId}`} kind="text">Data metrics</Link>
      <Link to={`/${bandId}/setlists/${setlistId}/delete`} kind="danger">Delete setlist</Link>
    </FlexList>
  )
}