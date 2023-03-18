import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/server-runtime";
import { ErrorContainer, ErrorMessage, FlexList, Input, Label, SaveButtons } from "~/components";
import { requireUserId } from "~/session.server";
import { updateBandByCode } from "~/models/band.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request)

  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  return json({ code })
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const bandCode = formData.get('bandCode')?.toString()

  if (!bandCode) {
    return json({ error: 'Band code is required' })
  }

  const band = await updateBandByCode(bandCode, userId)
  if ('error' in band) {
    return json({ error: band.error })
  }
  return redirect(`/${band.id}/setlists`)
}

export default function ExisitingBand() {
  const { code } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <Form method="put">
      <FlexList gap={0} pad={4}>
        <Label>Band Code</Label>
        <Input name="bandCode" placeholder="Enter your band code here..." defaultValue={code || ''} />
        {actionData?.error ? <ErrorMessage message={actionData.error} /> : null}
      </FlexList>
      <SaveButtons
        saveLabel="Add me to this band"
        cancelTo=".."
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}
