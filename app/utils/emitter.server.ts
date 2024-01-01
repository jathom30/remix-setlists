import { EventEmitter } from "events";

import { singleton } from "../singleton.server";

export const emitter = singleton("emitter", () => new EventEmitter());
