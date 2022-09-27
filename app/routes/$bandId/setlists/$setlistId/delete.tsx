import { Form, useParams } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from '@remix-run/node'
import invariant from "tiny-invariant";
import { ConfirmDelete } from "~/components";
import { deleteSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { setlistId, bandId } = params
  invariant(setlistId, 'setlistId not found')
  invariant(bandId, 'bandId not found')

  await deleteSetlist(setlistId)
  return redirect(`/${bandId}/setlists`)
}

export default function DeleteBand() {
  const { bandId, setlistId } = useParams()
  return (
    <Form method="delete">
      <ConfirmDelete
        label="Delete this setlist?"
        message="Once you delete this setlist it will be removed permanently."
        cancelTo={`/${bandId}/setlists/${setlistId}`}
      />
    </Form>
  )
}