import type { Band, Song } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getSongs(bandId: Band['id']) {
  return prisma.song.findMany({
    where: { bandId },
    select: { name: true, id: true },
    orderBy: { name: 'asc' }
  })
}

export async function getSong(songId: Song['id']) {
  return prisma.song.findUnique({
    where: { id: songId },
    include: { feels: true }
  })
}