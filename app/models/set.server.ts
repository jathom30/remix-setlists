import type { Set, Setlist, Song } from "@prisma/client";
import { prisma } from "~/db.server";

export async function removeSongFromSet(setId: Set['id'], songId: Song['id']) {
  const updatedSet = await prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        disconnect: { id: songId }
      },
    },
    include: { songs: true }
  })
  if (updatedSet.songs.length === 0) {
    return deleteSet(updatedSet.id)
  }
  return updatedSet
}

export async function getSetLength(songIds: Song['id'][]) {
  const songLengths = await prisma.song.findMany({
    where: { id: { in: songIds } },
    select: { length: true }
  })
  return songLengths.reduce((total, song) => (total += song.length), 0)
}

export async function addSongsToSet(setId: Set['id'], songIds: Song['id'][]) {
  const currentSet = await prisma.set.findUnique({ where: { id: setId }, include: { songs: { select: { id: true } } } })
  const currentSongIds = currentSet?.songs.map(song => song.id) || []
  const currentLength = await getSetLength(currentSongIds)
  return prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        connect: songIds.map(songId => ({ id: songId }))
      },
      length: await getSetLength(songIds) + currentLength
    }
  })
}

export async function createSet(setlistId: Setlist['id'], songIds: Song['id'][]) {

  return prisma.set.create({
    data: {
      setlistId,
      length: await getSetLength(songIds),
      songs: {
        connect: songIds.map(songId => ({ id: songId })),
      }
    }
  })
}

export async function deleteSet(setId: Set['id']) {
  return prisma.set.delete({
    where: { id: setId }
  })
}
