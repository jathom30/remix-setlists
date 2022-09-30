import type { Band, Setlist, Song } from "@prisma/client";
import { prisma } from "~/db.server";
import { createSet } from "./set.server";

export async function createSetlist(bandId: Band['id'], songIds: Song['id'][]) {
  const setlist = await prisma.setlist.create({
    data: {
      name: 'Temp name',
      updatedBy: 'remove this field',
      bandId,
    },
  })
  await createSet(setlist.id, songIds)
  return setlist
}

export async function getSetlists(bandId: Band['id'], params?: { q?: string }) {
  const setlists = prisma.setlist.findMany({
    where: {
      bandId,
      name: {
        contains: params?.q
      }
    },
    include: { sets: true },
    orderBy: { name: 'asc' },
  })
  return setlists
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

export async function updateSetlist(setlistId: Setlist['id'], setlist: Partial<Setlist>) {
  return prisma.setlist.update({
    where: { id: setlistId },
    data: setlist
  })
}

export async function deleteSetlist(setlistId: Setlist['id']) {
  return prisma.setlist.delete({
    where: { id: setlistId }
  })
}

export async function getRecentSetlists(bandId: Band['id']) {
  return prisma.setlist.findMany({
    where: { bandId },
    orderBy: { updatedAt: 'desc' },
    include: { sets: true },
    take: 5,
  })
}