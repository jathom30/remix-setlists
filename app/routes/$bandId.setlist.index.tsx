import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function loader({ params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  return redirect(`/${bandId}/setlists`)
}