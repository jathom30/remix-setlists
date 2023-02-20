import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import { useSpinDelay } from "spin-delay";
import invariant from "tiny-invariant";
import { Button, ErrorMessage, Field, FlexList, Input } from "~/components";
import { getBand, updateBand } from "~/models/band.server";
import { requireAdminMember } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const band = await getBand(bandId)
  if (!band) {
    throw new Response('Band not found', { status: 404 })
  }
  return json({ bandName: band.name })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const formData = await request.formData()
  const name = formData.get('name')

  if (typeof name !== 'string') {
    return json({
      error: { name: 'Name must be a string' }
    })
  }
  if (name.length < 3) {
    return json({
      error: { name: 'Band names must be at least 3 characters long' }
    })
  }
  await updateBand(bandId, { name })
  return redirect(`/${bandId}/band`)
}

export default function EditBandName() {
  const { bandName } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle')
  return (
    <Form method="put">
      <FlexList pad="md">
        <Field name="name" label="Band name">
          <Input name="name" defaultValue={bandName} placeholder={bandName} />
          {actionData?.error.name ? <ErrorMessage message={actionData.error.name} /> : null}
        </Field>
        <Button type="submit" kind="primary" icon={faSave} isSaving={isSubmitting}>Save</Button>
      </FlexList>
    </Form>
  )
}