import { Form, useCatch } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Button, FlexList, Link } from "~/components";
import { getBandMembers, removeMemberFromBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { roleEnums } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const bandMembers = await getBandMembers(bandId)

  if (!bandMembers) {
    throw new Response('Band members not found', { status: 404 })
  }

  // user can remove themself from band as long as they are not the only admin
  const otherMembers = bandMembers.members.filter(member => member.userId !== userId)
  const bandHasAdmin = otherMembers.some(member => member.role === roleEnums.admin)

  if (!bandHasAdmin) {
    throw new Response('Missing admin', { status: 403 })
  }

  return null
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')

  await removeMemberFromBand(bandId, userId)
  return redirect('/bandSelect')
}

export default function RemoveSelfFromBand() {
  return (
    <Form method="put">
      <FlexList pad={4} gap={2}>
        <h3 className="font-bold">Are you sure?</h3>
        <p className="text-xs text-text-subdued">This will remove your access to this band, but keep the band intact for other users.</p>
        <Button type="submit" kind="danger">Remove</Button>
        <Link to="..">Cancel</Link>
      </FlexList>
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <FlexList pad={4}>
      <h3 className="font-bold">Oops</h3>
      <p className="text-xs text-text-subdued">{error.message}</p>
      <Link to=".">Try again?</Link>
    </FlexList>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <FlexList pad={4}>
        <h3 className="font-bold">Oops</h3>
        <p className="text-xs text-text-subdued">This band was not found...</p>
        <Link to=".">Try again?</Link>
      </FlexList>
    )
  }
  if (caught.status === 403) {
    return (
      <FlexList pad={4}>
        <h3 className="font-bold">Unable to remove self</h3>
        <p className="text-xs text-text-subdued">Bands must have at least one <b>Admin</b>. Please upgrade at least one other member to admin status and try again.</p>
        <Link to="..">Back</Link>
      </FlexList>
    )
  }
}