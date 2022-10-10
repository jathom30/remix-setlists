import { faTrash } from "@fortawesome/free-solid-svg-icons";
import invariant from "tiny-invariant";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { Button, FlexList, ItemBox, Label, Link, RestrictedAlert, Tabs } from "~/components";
import { getBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { roleEnums } from "~/utils/enums";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import { useState } from "react";
import { updateBandMemberRole } from "~/models/usersInBands.server";
import { getFields } from "~/utils/form";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)

  const { bandId, memberId } = params
  invariant(bandId, 'bandId not found')
  invariant(memberId, 'memberId not found')

  const band = await getBand(bandId)
  const isAdmin = band?.members.find(m => m.userId === userId)?.role === roleEnums.admin

  if (!isAdmin) {
    throw new Response('Permission denied', { status: 403 })
  }

  const canRemoveMember = userId !== memberId && band.members.reduce((total, member) => total += member.role === roleEnums.admin ? 1 : 0, 0) > 0

  const member = await getUserById(memberId)
  const memberWithRole = {
    ...member,
    role: band?.members.find(m => m.userId === memberId)?.role
  }

  return json({ isAdmin, member: memberWithRole, canRemoveMember })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { bandId, memberId } = params
  const formData = await request.formData()

  invariant(memberId, 'memberId not found')
  invariant(bandId, 'bandId not found')

  const { fields, errors } = getFields<{ role: 'ADMIN' | 'MEMBER' | 'SUB' }>(formData, [
    { name: 'role', type: 'string', isRequired: true }
  ])

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 })
  }

  await updateBandMemberRole(bandId, memberId, fields.role)
  return null
}

export default function EditMember() {
  const { isAdmin, member, canRemoveMember } = useLoaderData<typeof loader>()
  const [roleTab, setRoleTab] = useState(member.role)
  const { bandId } = useParams()

  if (!isAdmin) {
    return <RestrictedAlert dismissTo={`/${bandId}/band`} />
  }

  return (
    <FlexList pad={4}>
      <FlexList gap={0}>
        <Label>Member</Label>
        <span className="font-bold">{member.name}</span>
      </FlexList>

      <FlexList gap={0}>
        <Label>Access Level</Label>
        <span className="font-bold">{member.role}</span>
      </FlexList>

      <FlexList gap={2}>
        <Label>Update member role</Label>
        <Tabs
          tabs={[
            { label: 'Admin', isActive: roleTab === roleEnums.admin, onClick: () => setRoleTab(roleEnums.admin) },
            { label: 'Member', isActive: roleTab === roleEnums.member, onClick: () => setRoleTab(roleEnums.member) },
            { label: 'Sub', isActive: roleTab === roleEnums.sub, onClick: () => setRoleTab(roleEnums.sub) },
          ]}
        >
          <FlexList>
            <p className="text-text-subdued text-sm">{roleExplanitoryText[roleTab || 'NOT_FOUND']}</p>
            <Form method="put" action=".">
              <FlexList>
                <Button type="submit" isDisabled={roleTab === member.role} name="role" value={roleTab} kind="secondary">{roleTab === member.role ? 'Current role' : `Set role as ${roleTab}`}</Button>
              </FlexList>
            </Form>
          </FlexList>
        </Tabs>
      </FlexList>


      <FlexList gap={2}>
        <Label>Danger Zone</Label>
        <ItemBox isDanger>
          <FlexList gap={2}>
            <span className="font-bold">Remove this member</span>
            {canRemoveMember ? (
              <p className="text-text-subdued text-sm">
                Removing this member will remove their access to this band's songs and setlists.
              </p>
            ) : (
              <p className="text-danger text-sm">
                You are the only admin. Make at least one other member an Admin before removing yourself.
              </p>
            )}

            <Link isDisabled={!canRemoveMember} to="delete" icon={faTrash} kind="danger">Remove</Link>
          </FlexList>
        </ItemBox>
      </FlexList>
    </FlexList>
  )
}

const roleExplanitoryText: Record<string, string> = {
  ADMIN: 'Admins can read, create, update, and delete songs and setlists. They can also add, remove, promote, and demote members. Additionally, they are able to update the band name and icon. Lastly, they are able to delete the band.',
  MEMBER: 'Members can read, create, update, and delete songs and setlists.',
  SUB: 'Subs have read only permissions. They are unable to add, remove, or edit songs, setlists, or band details.',
  NOT_FOUND: '--'
}