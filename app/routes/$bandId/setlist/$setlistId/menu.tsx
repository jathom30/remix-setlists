import { Form, useParams, useNavigation, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Button, FlexList, Link } from "~/components";
import { cloneSetlist, getSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { useSpinDelay } from "spin-delay";
import { faFileSignature, faListOl, faPenToSquare, faShareNodes, faTrash } from "@fortawesome/free-solid-svg-icons";

export async function loader({ request, params }: LoaderArgs) {
  const { setlistId, bandId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)

  const setlist = await getSetlist(setlistId)
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

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
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId, setlistId } = useParams()
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle' && navigation.location.pathname.includes('edit'))
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  return (
    <FlexList pad={4} gap={2}>
      <Link to="../confirmPublicLink" icon={faShareNodes} isOutline>{setlist.isPublic ? 'See' : 'Create'} public link</Link>
      {!isSub ? (
        <>
          <Link to={`/${bandId}/setlist/${setlistId}/rename`} isOutline icon={faFileSignature}>Rename setlist</Link>
          <Form method="post">
            <FlexList>
              <Button isSaving={isSubmitting} type="submit" isOutline icon={faPenToSquare}>Edit setlist</Button>
            </FlexList>
          </Form>
        </>
      ) : null}
      <Link to={`/${bandId}/setlist/condensed/${setlistId}`} isOutline icon={faListOl}>Condensed view</Link>
      {!isSub ? (
        <Link to={`/${bandId}/setlist/${setlistId}/delete`} kind="error" icon={faTrash}>Delete setlist</Link>
      ) : null}
    </FlexList>
  )
}
