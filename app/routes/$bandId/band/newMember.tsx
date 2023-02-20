import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import { Button, CatchContainer, CopyClick, ErrorContainer, FlexList, Label } from "~/components";
import { requireAdminMember } from "~/session.server";
import invariant from "tiny-invariant";
import { getBand, updateBandCode } from "~/models/band.server";
import { useFetcher, useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const band = await getBand(bandId)

  if (!band) {
    throw new Response('Band not found', { status: 404 })
  }

  return json({ band })
}

export async function action({ request, params }: ActionArgs) {
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  await updateBandCode(bandId)

  return redirect('.')
}

export default function NewMember() {
  const { band } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  return (
    <FlexList pad="md">
      <FlexList gap="none">
        <h5 className="text-xl font-bold">Invite new member</h5>
        <span className="text-text-subdued text-sm">Invite new members with the band code below.</span>
      </FlexList>

      <FlexList gap="none">
        <Label>Band code</Label>
        <CopyClick textToCopy={band.code} copyMessage={band.code} successMessage="Band code copied!" />
      </FlexList>

      <fetcher.Form method="put" action=".">
        <FlexList>
          <Button type="submit" kind="secondary" isSaving={fetcher.state !== 'idle'}>Generate new code</Button>
        </FlexList>
      </fetcher.Form>

      <div>
        <Label>NOTE:</Label>
        <FlexList>
          <p className="text-sm">All invited members will automatically be added as <b>SUB</b>s. They will be able to see your setlists and songs, but will not be able to make any changes.</p>
          <p className="text-sm">If you wish to upgrade their role, you can do so by clicking on their name in the members list after they join this band.</p>
        </FlexList>
      </div>
    </FlexList>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}