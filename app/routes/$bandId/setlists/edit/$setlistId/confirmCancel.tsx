import { Form, useSubmit } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Button, FlexList } from "~/components";
import { deleteSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const { bandId, setlistId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const intent = formData.get('intent')

  // if confirms cancel, delete cloned setlist and route to OG setlist
  if (intent === 'submit') {
    const setlist = await deleteSetlist(setlistId)
    return redirect(`/${bandId}/setlists/${setlist.editedFromId}`)
  }

  // if user wants to continue editing, redirect to edit route
  if (intent === 'cancel') {
    return redirect(`/${bandId}/setlists/edit/${setlistId}`)
  }
}

export default function ConfirmCancel() {
  const submit = useSubmit()
  return (
    <Form method="put">
      <FlexList pad={4}>
        <h1 className="font-bold">Cancel changes?</h1>
        <p className="text-slate-500">Are you sure you want to go back? You will lose all changes made to this setlist.</p>
        <Button name="intent" value="cancel" onClick={e => submit(e.currentTarget)}>Continue editing</Button>
        <Button name="intent" value="submit" kind="primary" type="submit">Confirm cancel</Button>
      </FlexList>
    </Form>
  )
}