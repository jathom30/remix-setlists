import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node"
import { createBand } from "~/models/band.server"
import { requireUserId } from "~/session.server"

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const name = formData.get('name')?.toString()

  if (!name) {
    return json({ error: 'Band name is required' })
  }

  const band = await createBand({ name }, userId)
  return redirect(`/${band.id}/setlists`)
}