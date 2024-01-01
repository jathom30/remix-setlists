import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { createEventStream } from "~/utils/create-event-stream.server";

export function loader({ request, params }: LoaderFunctionArgs) {
  const { setlistId } = params;
  invariant(setlistId, "setlistId not found");
  // Here we are listening for events emitted to this setlist and returning an event stream
  return createEventStream(request, `setlist:${setlistId}`);
}
