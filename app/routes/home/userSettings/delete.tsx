import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { Button, CatchContainer, ErrorContainer, ErrorMessage, FlexList, Input } from "~/components";
import { requireUser } from "~/session.server";
import { validateEmail } from "~/utils";
import { deleteUserByEmail } from "~/models/user.server";
import { getUserBands } from "~/models/usersInBands.server";
import { deleteBand, getBand } from "~/models/band.server";
import { RoleEnum } from "~/utils/enums";
import { useSpinDelay } from "spin-delay";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  return json({ userEmail: user?.email })
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const email = formData.get('email')

  if (!validateEmail(email)) {
    return json({
      errors: { email: 'Not a valid email' }
    })
  }
  if (email !== user.email) {
    return json({
      errors: { email: 'Email does not match' }
    })
  }

  const userBands = await getUserBands(user.id)
  await Promise.all(userBands.map(async userBand => {
    const band = await getBand(userBand.bandId)
    if (!band) return null
    // if user is only member in the band, delete band
    const userIsOnlyMember = band?.members.every(member => member.userId === user.id)
    // if other members, but no other Admins, delete band
    const userIsOnlyAdmin = band.members
      .filter(member => member.userId !== user.id)
      .every(member => member.role !== RoleEnum.ADMIN)
    if (userIsOnlyMember || userIsOnlyAdmin) {
      return await deleteBand(band.id)
    }
  }))

  await deleteUserByEmail(email)
  return redirect('.')
}

export default function DeleteUser() {
  const { userEmail } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [isDisabled, setIsDisabled] = useState(true)
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsDisabled(e.target.value !== userEmail)
  }

  return (
    <Form method="delete">
      <FlexList pad="md" gap="md">
        <h3 className="font-bold">Are you sure?</h3>
        <p className="text-xs text-text-subdued">Deleting your account is a <strong>perminant</strong> action and cannot be undone. If you wish to keep any bands intact after your deletion, promote another user to <strong>ADMIN</strong>. Otherwise, your bands and their songs and setlists will be deleted. Good luck and may god have mercy on your soul.</p>
        <p className="text-xs text-text-subdued">To delete, type your email below.</p>
        <Input onChange={handleChange} name="email" placeholder={userEmail} type="email" />
        {actionData?.errors.email ? (<ErrorMessage message="user email must match" />) : null}
        <Button kind="error" type="submit" isSaving={isSubmitting} isDisabled={isDisabled}>Delete</Button>
      </FlexList>
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}
export function CatchBoundary() {
  return <CatchContainer />
} 