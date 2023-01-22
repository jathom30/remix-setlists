import { Form, useParams, useNavigation } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Button, FlexList, Link } from "~/components";
import { cloneSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { useSpinDelay } from "spin-delay";

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
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle' && navigation.location.pathname.includes('edit'))
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  return (
    <FlexList pad={4} gap={2}>
      {!isSub ? (
        <>
          <Link to={`/${bandId}/setlist/${setlistId}/rename`} isOutline>Rename setlist</Link>
          <Form method="post">
            <FlexList>
              <Button isSaving={isSubmitting} type="submit" isOutline>Edit setlist</Button>
            </FlexList>
          </Form>
        </>
      ) : null}
      <Link to={`/${bandId}/setlist/condensed/${setlistId}`} isOutline>Condensed view</Link>
      {!isSub ? (
        <Link to={`/${bandId}/setlist/${setlistId}/delete`} kind="error">Delete setlist</Link>
      ) : null}
    </FlexList>
  )
}
