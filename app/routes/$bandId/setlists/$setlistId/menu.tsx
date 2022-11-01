import { useParams } from "@remix-run/react";
import { FlexList, Link } from "~/components";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export default function SetlistMenu() {
  const { bandId, setlistId } = useParams()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  return (
    <FlexList pad={4} gap={2}>
      {!isSub ? (
        <>
          <Link to={`/${bandId}/setlists/${setlistId}/rename`} kind="text">Rename setlist</Link>
          <Link to={`/${bandId}/setlists/edit/${setlistId}`} kind="text">Edit setlist</Link>
        </>
      ) : null}
      <Link to={`/${bandId}/setlists/condensed/${setlistId}`} kind="text">Condensed view</Link>
      {!isSub ? (
        <Link to={`/${bandId}/setlists/${setlistId}/delete`} kind="danger">Delete setlist</Link>
      ) : null}
    </FlexList>
  )
}