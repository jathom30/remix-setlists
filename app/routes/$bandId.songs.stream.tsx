import type { LoaderFunctionArgs } from "@remix-run/node";

import { createEventStream } from "~/utils/create-event-stream.server";
import { emitterKeys } from "~/utils/emitter-keys";

export function loader({ request }: LoaderFunctionArgs) {
  return createEventStream(request, emitterKeys.songs);
}
