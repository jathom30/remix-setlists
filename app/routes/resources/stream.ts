import type { LoaderArgs } from "@remix-run/server-runtime";
import { eventStream } from "remix-utils";
import { emitter } from "~/utils/emitter.server";

export async function loader({ request }: LoaderArgs) {
  return eventStream(request.signal, function setup(send) {
    function listener(setlist: string) {
      send({ event: 'setlist', data: setlist })
    }

    emitter.on('setlist', listener)
    return function clear() {
      emitter.off('setlist', listener)
    };
  });
}