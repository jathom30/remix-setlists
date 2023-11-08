import { ActionFunctionArgs, redirect } from "@remix-run/node";

import { userPrefs } from "~/models/cookies.server";

export async function action({ request }: ActionFunctionArgs) {
  const currentRoute = request.headers.get('referer') || ''
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  const formData = await request.formData()
  const sidebarState = formData.get('sidebar-state')?.toString() || ''
  cookie.sideMenu = sidebarState

  return redirect(currentRoute, {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
}