import { Form, useLoaderData, Link as RemixLink, useParams, useRouteError, isRouteErrorResponse, } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Button, CatchContainer, ConfirmDelete, ErrorContainer, FlexList } from "~/components";
import { removeMemberFromBand } from "~/models/usersInBands.server";
import { requireAdminMember, requireNonSubMember } from "~/session.server";
import { getBand } from "~/models/band.server";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  const { memberId, bandId } = params
  invariant(memberId, 'memberId not found')
  invariant(bandId, 'bandId not found')
  const userId = await requireAdminMember(request, bandId)
  const band = await getBand(bandId)
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }

  // cannot remove self from band if user if the only member
  const canRemoveMember = band.members.reduce((total, member) => total += member.role as unknown as RoleEnum === RoleEnum.ADMIN ? 1 : 0, 0) > (userId === memberId ? 1 : 0)

  return json({ canRemoveMember })
}

export async function action({ request, params }: ActionArgs) {
  const { memberId, bandId } = params
  invariant(memberId, 'memberId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  await removeMemberFromBand(bandId, memberId)
  return redirect(`/${bandId}/band`)
}

export default function DeleteMember() {
  const { canRemoveMember } = useLoaderData<typeof loader>()
  const { bandId } = useParams()

  if (!canRemoveMember) {
    return (
      <FlexList pad={4} gap={2}>
        <p className="text-danger text-sm">
          You are the only admin. Make at least one other member an Admin before removing yourself.
        </p>
        <p className="text-sm text-error">If you would rather delete this band, you can do so <RemixLink className="underline font-bold" to={`/${bandId}/band/delete`}>here</RemixLink>.</p>
        <Button isDisabled kind="warning">Remove member</Button>
      </FlexList>
    )
  }

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

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return (
      <ErrorContainer error={error as Error} />
    )
  }
  return <CatchContainer status={error.status} data={error.data} />
}
