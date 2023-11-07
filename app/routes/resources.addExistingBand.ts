import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";

import { updateBandByCode } from "~/models/band.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const bandCode = formData.get("bandCode")?.toString();

  if (!bandCode) {
    return json({ error: "Band code is required" });
  }

  const band = await updateBandByCode(bandCode, userId);
  if ("error" in band) {
    return json({ error: band.error });
  }
  return redirect(`/${band.id}/setlists`);
}
