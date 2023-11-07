import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Field, FlexList, Input, SaveButtons } from "~/components";
import { requireUser } from "~/session.server";
import { validateEmail } from "~/utils";
import { updateUser } from "~/models/user.server";
import invariant from "tiny-invariant";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  return json({ user })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const formData = await request.formData()
  const name = formData.get('name')
  const email = formData.get('email')

  if (typeof name !== 'string') {
    return json({
      errors: {
        name: 'Invalid name',
        email: null
      }
    })
  }
  if (typeof email !== 'string' || !validateEmail(email)) {
    return json({
      errors: {
        name: null,
        email: 'Invalid email',
      }
    })
  }

  // if user updated their email, set user to not verified and redirect to verify screen
  const verified = email === user.email
  await updateUser(user.id, {
    name,
    email,
    verified
  })

  return redirect(`/${bandId}/user`)

}

export default function EditUserDetails() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <Form method="put">
      <FlexList pad={4}>
        <p className="font-bold">Update user details</p>
        <Field name="name" label="Name">
          <Input name="name" placeholder="Your name" defaultValue={user.name || ''} />
        </Field>
        <Field name="email" label="Email">
          <Input name="email" placeholder="Your email" defaultValue={user.email || ''} />
          <span className="text-sm text-slate-500 pt-1"><strong className="text-danger">NOTE:</strong> Updating your email address will cause you to reverify your account via an emailed link. You will not lose any data.</span>
        </Field>
      </FlexList>
      <SaveButtons saveLabel="Update user details" cancelTo=".." />
    </Form>
  )
}