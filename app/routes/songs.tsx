import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)

  return json({ userId })
}

export default function Songs() {
  return (
    <div>
      <h1>The Songs</h1>
      {/* {userBands.map(band => (
        <p key={band.bandId}>{band.bandId}</p>
      ))} */}
    </div>
  )
}