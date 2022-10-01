import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Avatar, ErrorMessage, FlexList, Input, Label, SaveButtons } from "~/components";
import { getBand, updateBand } from "~/models/band.server";
import { getFields } from "~/utils/form";

export async function loader({ params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const band = await getBand(bandId)

  if (!band) {
    throw new Response('Band not found', { status: 404 })
  }
  return json({ band })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')

  const formData = await request.formData()

  const { fields, errors } = getFields<{ name: string }>(formData, [{ name: 'name', type: 'string', isRequired: true }])

  if (Object.keys(errors).length) {
    return json({ errors })
  }

  await updateBand(bandId, fields)
  return redirect(`/${bandId}/band`)
}

export default function EditBand() {
  const { band } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <Form method="put">
      <FlexList pad={4}>
        <FlexList gap={0}>
          <Label required>Band name</Label>
          <Input name="name" placeholder="Band name..." defaultValue={band.name} />
          {actionData?.errors.name ? <ErrorMessage message="Band name required" /> : null}
        </FlexList>
        <FlexList gap={0}>
          <Label>Icon</Label>
          <Avatar bandName={band.name} icon={band.icon} size="lg" />
        </FlexList>
      </FlexList>
      <SaveButtons
        saveLabel="Save"
        cancelTo=".."
      />
    </Form>
  )
}