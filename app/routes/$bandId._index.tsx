import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function loader({ params }: LoaderFunctionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  return redirect(`/${bandId}/home`)
}