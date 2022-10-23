import { Form, useCatch, useParams } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { ConfirmDelete, ErrorContainer, FlexList, Link } from "~/components";
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
  return redirect(`/${bandId}/setlists/edit/${setlistId}`)
}

export default function RemoveSongFromSetlist() {
  const { bandId, setlistId } = useParams()
  return (
    <Form method="put">
      <ConfirmDelete
        label="Remove this song?"
        deleteLabel="Remove"
        message="This will remove this song from the set. You can add it back at any time by clicking the “Add songs” button."
        cancelTo={`/${bandId}/setlists/edit/${setlistId}`}
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}

export function CatchBoundary() {
  const { bandId, setlistId } = useParams()
  const caught = useCatch()

  console.log(caught)
  return (
    <FlexList pad={4} gap={2}>
      <h1 className="text-3xl font-bold">Oops...</h1>
      <p>{caught.data}</p>
      <Link to={`/${bandId}/setlists/edit/${setlistId}`}>Go back</Link>
    </FlexList>
  )
}
