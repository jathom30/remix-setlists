import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { createEventStream } from "~/utils/create-event-stream.server";

export function loader({ request, params }: LoaderFunctionArgs) {
  const { songId } = params;
  invariant(songId, "songId not found");
  return createEventStream(request, `song:${songId}`);
}
