import type { LoaderFunctionArgs } from "@remix-run/node";

import { createEventStream } from "~/utils/create-event-stream.server";

export function loader({ request }: LoaderFunctionArgs) {
  return createEventStream(request, "setlists");
}
