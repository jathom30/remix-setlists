import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ConfirmDelete } from "~/components";
import { deleteSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  await deleteSong(songId)
  return redirect(`/${bandId}/songs`)
}

export default function DeleteSong() {
  const { bandId, songId } = useParams()
  return (
    <Form method="delete">
      <ConfirmDelete
        label="Delete this song?"
        message="Once you delete this song it will be removed from this band and any setlists it was used in."
        cancelTo={`/${bandId}/songs/${songId}`}
      />
    </Form>
  )
}