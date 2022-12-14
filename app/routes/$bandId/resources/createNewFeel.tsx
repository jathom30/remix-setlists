import type { ActionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { createFeel } from "~/models/feel.server";
import { requireNonSubMember } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const newFeel = formData.get('newFeel')

  if (newFeel && typeof newFeel === 'string') {
    return json({
      newFeel: await createFeel(newFeel, bandId)
    })
  }
}
