import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { requireUserId } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const redirectTo = formData.get("redirectTo")?.toString();
  invariant(redirectTo, "redirectTo not found");

  const requestUrl = new URL(request.url).searchParams;

  const sort = formData.get("sort");

  const searchParams = new URLSearchParams(requestUrl);

  if (typeof sort !== "string") {
    return redirect(`${redirectTo}?${searchParams.toString()}`);
  }

  searchParams.delete("sort");
  searchParams.append("sort", sort);

  return redirect(`${redirectTo}?${searchParams.toString()}`);
}
