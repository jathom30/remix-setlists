import { faTrash } from "@fortawesome/free-solid-svg-icons";
import invariant from "tiny-invariant";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { Button, FlexList, ItemBox, Label, Link, Tabs } from "~/components";
import { getBand } from "~/models/band.server";
import { requireAdminMember, requireUserId } from "~/session.server";
import { RoleEnum } from "~/utils/enums";
import { Form, useLoaderData, useParams, Link as RemixLink } from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import { useState } from "react";
import { updateBandMemberRole } from "~/models/usersInBands.server";
import { getFields } from "~/utils/form";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)

  const { bandId, memberId } = params
  invariant(bandId, 'bandId not found')
  invariant(memberId, 'memberId not found')

  await requireAdminMember(request, bandId)

  const band = await getBand(bandId)

  if (!band) {
    throw new Response('Band not found', { status: 404 })
  }

  // cannot remove self from band if user if the only member
  const canRemoveMember = band.members.reduce((total, member) => total += member.role as unknown as RoleEnum === RoleEnum.ADMIN ? 1 : 0, 0) > (userId === memberId ? 1 : 0)

  // if there are other members who are also admins, user can demote self from admin
  const canRemoveAsAdmin = band.members.filter(member => member.userId !== memberId).some(member => member.role === RoleEnum.ADMIN)

  const member = await getUserById(memberId)
  const memberWithRole = {
    ...member,
    role: band?.members.find(m => m.userId === memberId)?.role
  }

  return json({ member: memberWithRole, canRemoveMember, canRemoveAsAdmin })
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

  console.log({ bandId, memberId, fields })
  await updateBandMemberRole(bandId, memberId, fields.role)
  return null
}

export default function EditMember() {
  const { member, canRemoveMember, canRemoveAsAdmin } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
  const [roleTab, setRoleTab] = useState(member.role)

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
            { label: 'Admin', isActive: roleTab === RoleEnum.ADMIN, onClick: () => setRoleTab(RoleEnum.ADMIN) },
            { label: 'Member', isActive: roleTab === RoleEnum.MEMBER, onClick: () => setRoleTab(RoleEnum.MEMBER) },
            { label: 'Sub', isActive: roleTab === RoleEnum.SUB, onClick: () => setRoleTab(RoleEnum.SUB) },
          ]}
        >
          <FlexList>
            <p className="text-sm">{roleExplanitoryText[roleTab || 'NOT_FOUND']}</p>
            <Form method="put">
              <FlexList>
                {(!canRemoveAsAdmin && roleTab !== RoleEnum.ADMIN) ? (
                  <p className="text-sm text-error">You are the only <strong>admin</strong> on this band. Make at least one other member an Admin before updating your role.</p>
                ) : null}
                <Button type="submit" isDisabled={roleTab === member.role || !canRemoveAsAdmin} name="role" value={roleTab as unknown as string} kind="secondary">{roleTab === member.role ? 'Current role' : `Set role as ${roleTab}`}</Button>
              </FlexList>
            </Form>
          </FlexList>
        </Tabs>
      </FlexList>


      <FlexList gap={2}>
        <Label isDanger>Danger Zone</Label>
        <ItemBox>
          <FlexList gap={2}>
            <span className="font-bold">Remove this member</span>
            {canRemoveMember ? (
              <p className="text-sm">
                Removing this member will remove their access to this band's songs and setlists.
              </p>
            ) : (
              <>
                <p className="text-danger text-sm">
                  You are the only admin. Make at least one other member an Admin before removing yourself.
                </p>
                <p className="text-sm text-error">If you would rather delete this band, you can do so <RemixLink className="underline font-bold" to={`/${bandId}/band/delete`}>here</RemixLink>.</p>
              </>
            )}

            <Link isDisabled={!canRemoveMember} to="delete" icon={faTrash} kind="error">Remove</Link>
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