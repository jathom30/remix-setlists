import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { getSetlists } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import { Link } from "~/components";
import { getTempBand } from "~/models/band.server";
import invariant from "tiny-invariant";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request)
  const band = await getTempBand('Starter Band')
  invariant(band, 'band not found')

  const setlists = await getSetlists(band.name)
  return json({ setlists })
}

export default function Setlists() {
  const { setlists } = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>The Setlists</h1>
      {setlists.map(setlist => (
        <Link key={setlist.id} to={setlist.id}>{setlist.name}</Link>
      ))}
    </div>
  )
}