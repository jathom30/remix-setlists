import type { Band, Setlist } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getSetlists(bandId: Band['id']) {
  return prisma.setlist.findMany({
    where: { bandId },
    select: { name: true, id: true },
    orderBy: { updatedAt: 'asc' },
  })
}

export async function getSetlist(setlistId: Setlist['id']) {
  return prisma.setlist.findUnique({
    where: { id: setlistId },
    include: {
      sets: {
        include: { songs: true }
      }
    }
  })
}