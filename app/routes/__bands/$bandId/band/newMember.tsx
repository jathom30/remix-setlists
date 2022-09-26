import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { FlexList, Label, RestrictedAlert } from "~/components";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { getBand } from "~/models/band.server";
import { roleEnums } from "~/utils/enums";
import { useLoaderData, useParams } from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)

  const bandId = params.bandId
  invariant(bandId, 'bandId not found')

  const band = await getBand(bandId)
  const isAdmin = band?.members.find(m => m.userId === userId)?.role === roleEnums.admin

  return json({ isAdmin, band })
}

export default function NewMember() {
  const { isAdmin, band } = useLoaderData<typeof loader>()
  const { bandId } = useParams()

  if (!isAdmin) {
    return <RestrictedAlert dismissTo={`/${bandId}/band`} />
  }
  return (
    <FlexList pad={4}>
      <FlexList gap={0}>
        <h5 className="text-xl font-bold">Invite new member</h5>
        <span className="text-text-subdued text-sm">Invite new members with the band code below.</span>
      </FlexList>

      <FlexList gap={0}>
        <Label>Band code</Label>
        <button className=" rounded border flex justify-between items-center p-2">
          <span className="font-bold">{band?.code}</span>
          <FontAwesomeIcon icon={faCopy} />
        </button>
      </FlexList>

      <div>
        <Label>NOTE:</Label>
        <p className="text-sm">All invited members will automatically be added as <b>SUB</b>s. They will be able to see your setlists and songs, but will not be able to make any changes.</p>
        <p className="text-sm">If you wish to upgrade their role, you can do so by clicking on their name in the members list after they join this band.</p>
      </div>
    </FlexList>
  )
}