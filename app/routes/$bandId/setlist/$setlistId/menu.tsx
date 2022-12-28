import { Form, useParams, useTransition } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Button, FlexList, Link } from "~/components";
import { cloneSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export async function action({ request, params }: ActionArgs) {
  const { setlistId, bandId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)

  const clonedSetlist = await cloneSetlist(setlistId)
  if (!cloneSetlist) {
    return new Error('Setlist could not be edited')
  }
  return redirect(`/${bandId}/setlist/edit/${clonedSetlist?.id}`)
}

export default function SetlistMenu() {
  const { bandId, setlistId } = useParams()
  const transition = useTransition()
  const isLoadingSaveRoute = transition.state !== 'idle' && transition.location.pathname.includes('edit')
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  return (
    <FlexList pad={4} gap={2}>
      {!isSub ? (
        <>
          <Link to={`/${bandId}/setlist/${setlistId}/rename`} kind="text">Rename setlist</Link>
          <Form method="post">
            <FlexList>
              <Button isSaving={isLoadingSaveRoute} type="submit" kind="text">Edit setlist</Button>
            </FlexList>
          </Form>
        </>
      ) : null}
      <Link to={`/${bandId}/setlist/condensed/${setlistId}`} kind="text">Condensed view</Link>
      {!isSub ? (
        <Link to={`/${bandId}/setlist/${setlistId}/delete`} kind="danger">Delete setlist</Link>
      ) : null}
    </FlexList>
  )
}
