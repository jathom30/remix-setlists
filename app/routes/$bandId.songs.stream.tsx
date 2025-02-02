import type { LoaderFunctionArgs } from "react-router";

import { createEventStream } from "~/utils/create-event-stream.server";
import { emitterKeys } from "~/utils/emitter-keys";

export function loader({ request }: LoaderFunctionArgs) {
  return createEventStream(request, emitterKeys.songs);
}
