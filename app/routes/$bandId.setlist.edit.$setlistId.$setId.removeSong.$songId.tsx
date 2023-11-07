import { Form, isRouteErrorResponse, useParams, useRouteError } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { CatchContainer, ConfirmDelete, ErrorContainer } from "~/components";
import { requireNonSubMember } from "~/session.server";
import { removeSongFromSet } from "~/models/set.server";

export async function action({ request, params }: ActionArgs) {
  const { songId, setlistId, bandId, setId } = params
  invariant(songId, 'songId not found')
  invariant(setlistId, 'setlistId not found')
  invariant(bandId, 'bandId not found')
  invariant(setId, 'setId not found')
  await requireNonSubMember(request, bandId)

  await removeSongFromSet(setId, songId)
  return redirect(`/${bandId}/setlist/loadingSetlist?setlistId=${setlistId}`)
}

export default function RemoveSongFromSetlist() {
  const { bandId, setlistId } = useParams()
  return (
    <Form method="put">
      <ConfirmDelete
        label="Remove this song?"
        deleteLabel="Remove"
        message="This will remove this song from the set. You can add it back at any time by clicking the “Add songs” button."
        cancelTo={`/${bandId}/setlist/edit/${setlistId}`}
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
