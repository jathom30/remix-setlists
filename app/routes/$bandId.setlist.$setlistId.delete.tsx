import { Form, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from '@remix-run/node'
import invariant from "tiny-invariant";
import { ConfirmDelete, ErrorContainer } from "~/components";
import { deleteSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  return null
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { setlistId, bandId } = params
  invariant(setlistId, 'setlistId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

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
        cancelTo={`/${bandId}/setlist/${setlistId}`}
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}