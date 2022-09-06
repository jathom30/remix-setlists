import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)

  return json({ userId })
}

export default function Setlists() {
  return (
    <div>
      <h1>The Setlists</h1>
    </div>
  )
}