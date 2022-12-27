import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Form, useSubmit, useTransition } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Button, FlexHeader, FlexList, Link } from "~/components";
import { requireNonSubMember } from "~/session.server";
import { getSetlist, overwriteSetlist, updateSetlist } from "~/models/setlist.server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export async function action({ request, params }: ActionArgs) {
  const { bandId, setlistId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const intent = formData.get('intent')

  const clonedSetlist = await getSetlist(setlistId)
  if (!clonedSetlist?.editedFromId) {
    return null
  }

  // on new, remove editedFromId and redirect to rename setlist page
  if (intent === 'new') {
    await updateSetlist(setlistId, { editedFromId: null })
    return redirect(`/${bandId}/setlists/${setlistId}/rename`)
  }

  // on overwrite, update OG setlist to match cloned setlist, then delete clone and redirect to OG
  if (intent === 'overwrite') {
    await overwriteSetlist(clonedSetlist.id)
  }

  return redirect(`/${bandId}/setlists/${clonedSetlist.editedFromId}`)
}

export default function SaveChanges() {
  const submit = useSubmit()
  const transition = useTransition()
  const isSaving = transition.state !== 'idle'

  return (
    <Form method="put">
      <FlexList pad={4}>
        <FlexHeader>
          <h1 className="font-bold">Save these changes?</h1>
          <Link to=".." isRounded><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
        <p className="text-slate-500">You can either save these changes to the exisiting setlist or create a new setlist based off these changes and keep the original setlist uneffected.</p>
        <Button name="intent" value="overwrite" kind="primary" type="submit" isSaving={isSaving} icon={faSave}>Save</Button>
        <Button name="intent" value="new" kind="secondary" isSaving={isSaving} onClick={e => submit(e.currentTarget)}>Save as new</Button>
      </FlexList>
    </Form>
  )
}