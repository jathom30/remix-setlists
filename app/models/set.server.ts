import type { Set, Setlist, Song } from "@prisma/client";
import { prisma } from "~/db.server";

export async function removeSongFromSet(setId: Set['id'], songId: Song['id']) {
  const updatedSet = await prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        delete: { songId_setId: { setId, songId } }
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

export async function getSet(setId: Set['id']) {
  return prisma.set.findUnique({ where: { id: setId }, include: { songs: true } })
}

export async function getSetMetrics(setId: Set['id']) {
  const set = await prisma.set.findUnique({ where: { id: setId }, include: { songs: { include: { song: { include: { feels: true } } } } } })
  const feels = set?.songs.map(song => song.song?.feels).flat()
  const tempos = set?.songs.map(song => song.song?.tempo || 0) || []
  const isCoverLength = set?.songs.filter(song => song.song?.isCover).length || 0
  const isOriginalLength = set?.songs.filter(song => !song.song?.isCover).length || 0
  return { feels, tempos, isCoverLength, isOriginalLength }
}

export async function addSongsToSet(setId: Set['id'], songIds: Song['id'][]) {
  const set = await getSet(setId)
  const lastSongPosition = set?.songs.reduce((highestPosition, song) => {
    if (song.positionInSet > highestPosition) {
      return song.positionInSet
    }
    return highestPosition
  }, 0) || 0
  return prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        create: songIds.map((songId, index) => ({
          songId,
          positionInSet: index + lastSongPosition,
        }))
      },
    }
  })
}

export async function createSet(setlistId: Setlist['id'], songIds: Song['id'][], positionInSetlist: Set['positionInSetlist']) {

  return prisma.set.create({
    data: {
      setlistId,
      positionInSetlist,
      songs: {
        create: songIds.map((songId, index) => ({
          songId,
          positionInSet: index
        }))
      }
    }
  })
}

export async function updateSet({ setId, songIds, positionInSetlist }: { setId: Set['id'], songIds?: Song['id'][], positionInSetlist?: Set['positionInSetlist'] }) {
  return prisma.set.update({
    where: { id: setId },
    data: {
      ...(songIds ? {
        songs: {
          deleteMany: {},
          create: songIds?.map((songId, index) => ({
            songId,
            positionInSet: index,
          })),
        }
      } : null),
      ...(positionInSetlist ? { positionInSetlist } : null),
    }
  })
}

export async function deleteSet(setId: Set['id']) {
  return prisma.set.delete({
    where: { id: setId }
  })
}
