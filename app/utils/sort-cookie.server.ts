import { userPrefs } from "~/models/cookies.server";

export async function updateSortCookie({
  request,
  sortQuery,
  defaultSort,
  cookieKey,
}: {
  request: Request;
  sortQuery: string | null;
  defaultSort?: string;
  cookieKey: "songSort" | "feelSort" | "setlistSort";
}) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  const cookieSort = cookie[cookieKey];
  // update sort from cookie if not in url
  if (
    !sortQuery &&
    cookie &&
    typeof cookie === "object" &&
    cookieKey in cookie
  ) {
    sortQuery = String(cookieSort);
  }

  // set default sort if not in url or cookie
  if (!sortQuery && !cookieSort && defaultSort) {
    sortQuery = defaultSort;
  }

  cookie[cookieKey] = sortQuery;

  return {
    header: { "Set-Cookie": await userPrefs.serialize(cookie) },
    sort: sortQuery,
  };
}
