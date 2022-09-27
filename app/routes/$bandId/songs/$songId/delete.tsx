import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ConfirmDelete } from "~/components";
import { deleteSong, getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { songId } = params
  invariant(songId, 'songId not found')

  const song = await getSong(songId, true)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  await deleteSong(songId)
  return redirect(`/${bandId}/songs`)
}

export default function DeleteSong() {
  const { song } = useLoaderData<typeof loader>()
  const { bandId, songId } = useParams()

  return (
    <Form method="delete">
      <ConfirmDelete
        label="Delete this song?"
        message={`${song.name} is currently being used in ${song.sets.length} set(s). Once you delete this song it will be removed from this band and any setlists it was used in.`}
        cancelTo={`/${bandId}/songs/${songId}`}
      />
    </Form>
  )
}