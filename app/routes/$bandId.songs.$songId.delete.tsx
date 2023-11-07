import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import invariant from "tiny-invariant";
import { CatchContainer, ConfirmDelete, ErrorContainer } from "~/components";
import { deleteSong, getSong } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const response = await getSong(songId, bandId, true)
  const song = response?.song
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song })
}

export async function action({ request, params }: ActionArgs) {
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  await deleteSong(songId)
  return redirect(`/${bandId}/songs`)
}

export default function DeleteSong() {
  const { song } = useLoaderData<typeof loader>()

  return (
    <Form method="delete">
      <ConfirmDelete
        label="Delete this song?"
        message={`${song.name} is currently being used in ${song.sets.length} set(s). Once you delete this song it will be removed from this band and any setlists it was used in.`}
        cancelTo=".."
      />
    </Form>
  )
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return (
      <ErrorContainer error={error as Error} />
    )
  }
  return <CatchContainer status={error.status} data={error.data} />
}