import { Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";

export const totalSetLength = (set: SerializeFrom<Song>[]) =>
  set.reduce((total, song) => total + song.length, 0);
