import { faTrash } from "@fortawesome/free-solid-svg-icons";
import invariant from "tiny-invariant";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { FlexList, ItemBox, Label, Link, RadioGroup, RestrictedAlert } from "~/components";
import { getBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { roleEnums } from "~/utils/enums";
import { Form, useLoaderData, useParams, useSubmit } from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import type { FormEvent } from "react";
import { updateBandMemberRole } from "~/models/usersInBands.server";
import { getFields } from "~/utils/form";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)

  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  const memberId = params.memberId
  invariant(memberId, 'memberId not found')

  const band = await getBand(bandId)
  const isAdmin = band?.members.find(m => m.userId === userId)?.role === roleEnums.admin
  const member = await getUserById(memberId)
  const memberWithRole = {
    ...member,
    role: band?.members.find(m => m.userId === memberId)?.role
  }

  return json({ isAdmin, member: memberWithRole })
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
  const { isAdmin, member } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
  const submit = useSubmit()

  if (!isAdmin) {
    return <RestrictedAlert dismissTo={`/${bandId}/band`} />
  }

  const handleRoleChange = (e: FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget, { replace: true })
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

      <Form method="put" onChange={handleRoleChange} action=".">
        <FlexList gap={0}>
          <Label>Update member role</Label>
          <RadioGroup
            name="role"
            options={[
              { label: 'Admin', value: roleEnums.admin },
              { label: 'Member', value: roleEnums.member },
              { label: 'Sub', value: roleEnums.sub },
            ]}
            isChecked={val => member.role === val}
          />
          <p className="text-text-subdued text-sm">{roleExplanitoryText[member.role || 'NOT_FOUND']}</p>
        </FlexList>
      </Form>


      <FlexList gap={2}>
        <Label>Danger Zone</Label>
        <ItemBox isDanger>
          <FlexList gap={2}>
            <span className="font-bold">Remove this member</span>
            <p className="text-text-subdued text-sm">Removing this member will remove their access to this band's songs and setlists.</p>
            <Link to="." icon={faTrash} kind="danger">Remove</Link>
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