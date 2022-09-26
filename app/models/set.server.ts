import type { Set, Song } from "@prisma/client";
import { prisma } from "~/db.server";

export async function removeSongFromSet(setId: Set['id'], songId: Song['id']) {
  return prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        disconnect: { id: songId }
      }
    },
  })
}

export async function addSongsToSet(setId: Set['id'], songIds: Song['id'][]) {
  return prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        connect: songIds.map(songId => ({ id: songId }))
      }
    }
  })
}