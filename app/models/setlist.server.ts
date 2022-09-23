import type { Band, Setlist } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getSetlists(bandId: Band['id']) {
  const setlists = prisma.setlist.findMany({
    where: { bandId },
    include: { sets: true },
    orderBy: { updatedAt: 'asc' },
  })
  return (await setlists).map(setlist => {
    return {
      ...setlist,
      number_of_sets: setlist.sets.length,
      length: 45
    }
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

export async function getSetlistName(setlistId: Setlist['id']) {
  return prisma.setlist.findUnique({
    where: { id: setlistId },
    select: { name: true }
  })
}