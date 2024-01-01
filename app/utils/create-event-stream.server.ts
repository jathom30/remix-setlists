import { eventStream } from "remix-utils/sse/server";

import { emitter } from "./emitter.server";

export function createEventStream(request: Request, eventName: string) {
  return eventStream(request.signal, (send) => {
    const handle = () => {
      send({
        data: JSON.stringify({
          now: String(Date.now()),
          eventName,
        }),
      });
    };

    emitter.addListener(eventName, handle);

    return () => {
      emitter.removeListener(eventName, handle);
    };
  });
}
