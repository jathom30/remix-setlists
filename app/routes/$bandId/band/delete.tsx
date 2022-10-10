import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { Button, ErrorContainer, ErrorMessage, FlexList, Input } from "~/components";
import { deleteBand, getBandName } from "~/models/band.server";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { getFields } from "~/utils/form";

export async function loader({ params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const bandName = await getBandName(bandId)

  if (!bandName) {
    throw new Response('Band not found', { status: 404 })
  }

  return json({ bandName: bandName.name })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')

  const formData = await request.formData()

  const { errors } = getFields<{ bandName: string }>(formData, [{ name: 'bandName', type: 'string', isRequired: true }])

  if (Object.keys(errors).length) {
    return json({ errors })
  }

  await deleteBand(bandId)
  return redirect('/bandSelect')
}

export default function DeleteBand() {
  const { bandName } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDisabled, setIsDisabled] = useState(true)


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsDisabled(e.target.value !== bandName)
  }

  return (
    <Form method="delete">
      <FlexList pad={4} gap={2}>
        <h3 className="font-bold">Are you sure?</h3>
        <p className="text-xs text-text-subdued">Deleting this band will destroy all songs and setlists associated with the band as well as remove any other band member's connection to this band.</p>
        <p className="text-xs text-text-subdued">To delete, type this band's name below.</p>
        <Input onChange={handleChange} inputRef={inputRef} name="bandName" placeholder={bandName} />
        {actionData?.errors.bandName ? (<ErrorMessage message="Band name must match" />) : null}
        <Button kind="danger" isDisabled={isDisabled}>Delete</Button>
      </FlexList>
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}

export function CatchBoundary() {
  return (
    <FlexList pad={4}>
      <h3 className="font-bold">404 Not found</h3>
      <p>Band not found</p>
    </FlexList>
  )
}
