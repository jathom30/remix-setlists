import { LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getUnseenNotesCount } from "~/models/setlist-notes";
import { getSetlist } from "~/models/setlist.server";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { getDomainUrl } from "~/utils/assorted";

export async function setlistLoader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  if (setlist.bandId !== bandId) {
    throw new Response("Setlist does not belong to this band.", {
      status: 403,
    });
  }

  const unseenNotesCount = await getUnseenNotesCount(setlistId, userId);

  const allSongs = await getSongs(bandId, { sort: "name:asc" });

  const domainUrl = getDomainUrl(request);
  const setlistLink = `${domainUrl}/${setlist.bandId}/setlists/${setlist.id}`;

  const publicSearchParams = new URLSearchParams();
  publicSearchParams.set("bandId", bandId);
  publicSearchParams.set("setlistId", setlistId);
  const setlistPublicUrl = `${domainUrl}/publicSetlist?${publicSearchParams.toString()}`;
  return json({
    setlist,
    setlistLink,
    allSongs,
    unseenNotesCount,
    ...(setlist.isPublic ? { setlistPublicUrl } : {}),
  });
}
