import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { createFeel } from "~/models/feel.server";
import { requireNonSubMember } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const newFeel = formData.get("newFeel");

  if (newFeel && typeof newFeel === "string") {
    return json({
      error: null,
      newFeel: await createFeel(newFeel, bandId),
    });
  }
  return json({ error: "Could not create feel", newFeel: null });
}

export type FeelSelectAction = typeof action;