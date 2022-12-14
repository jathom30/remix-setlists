import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { CatchContainer, ConfirmDelete, ErrorContainer } from "~/components";
import { deleteFeel, getFeel } from "~/models/feel.server";
import { requireNonSubMember } from "~/session.server";
import { Form, useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId, feelId } = params
  invariant(bandId, 'bandId not found')
  invariant(feelId, 'feelId not found')
  await requireNonSubMember(request, bandId)

  const feel = await getFeel(feelId)

  if (!feel) {
    throw new Response('Feel not found', { status: 404 })
  }

  return json({ feel })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId, feelId } = params
  invariant(bandId, 'bandId not found')
  invariant(feelId, 'feelId not found')
  await requireNonSubMember(request, bandId)

  await deleteFeel(feelId)
  return redirect(`/${bandId}/band`)
}

export default function DeleteFeel() {
  const { feel } = useLoaderData<typeof loader>()
  return (
    <Form method="delete">
      <ConfirmDelete
        label={`Are you sure you want to delete ${feel.label}?`}
        deleteLabel={`Delete ${feel.label}`}
        message={`Deleting ${feel.label} will remove it from all songs it is currently added to.`}
        cancelTo=".."
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}
