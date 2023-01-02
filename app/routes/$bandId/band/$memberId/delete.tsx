import { Form } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ConfirmDelete, ErrorContainer } from "~/components";
import { removeMemberFromBand } from "~/models/usersInBands.server";
import { requireNonSubMember } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const { memberId, bandId } = params
  invariant(memberId, 'memberId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  await removeMemberFromBand(bandId, memberId)
  return redirect(`/${bandId}/band`)
}

export default function DeleteMember() {
  return (
    <Form method="put">
      <ConfirmDelete
        label="Are you sure?"
        message="Removing this member will remove their access to this band. Members can be re-added at any time."
        deleteLabel="Remove member"
        cancelTo=".."
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}