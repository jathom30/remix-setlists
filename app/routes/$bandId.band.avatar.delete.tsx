import { Form } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ConfirmDelete } from "~/components";
import { updateBandIcon } from "~/models/bandIcon.server";
import { requireAdminMember } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  await updateBandIcon(bandId, { path: null })
  return redirect(`/${bandId}/band/avatar`)
}

export default function DeleteBandAvatar() {
  return (
    <Form method="put">
      <ConfirmDelete
        label="Remove avatar image?"
        deleteLabel="Remove"
        message="This will remove this image from your band. You can add a new one at any time."
        cancelTo=".."
      />
    </Form>
  )
}