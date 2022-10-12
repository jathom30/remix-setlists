import type { Band, Setlist, Song } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getSongs(bandId: Band['id'], params?: { q?: string, tempos?: number[], isCover?: boolean }) {
  console.log(params)
  return prisma.song.findMany({
    where: {
      bandId,
      name: {
        contains: params?.q,
      },
      tempo: {
        in: params?.tempos
      },
      ...(params?.isCover === false ? { NOT: { isCover: true } } : null),
      ...(params?.isCover === true ? { isCover: true } : null),
    },
    orderBy: { name: 'asc' }
  })
}

export async function getSong(songId: Song['id'], includeSets?: boolean) {
  return prisma.song.findUnique({
    where: { id: songId },
    include: { feels: true, sets: includeSets }
  })
}

export async function getSongName(songId: Song['id']) {
  return prisma.song.findUnique({
    where: { id: songId },
    select: { name: true }
  })
}

export async function updateSong(songId: Song['id'], song: Omit<Song, 'id' | 'updatedAt' | 'createdAt'>) {
  return prisma.song.update({
    where: { id: songId },
    data: song
  })
}

export async function createSong(bandId: Band['id'], song: Omit<Song, 'id' | 'updatedAt' | 'createdAt' | 'bandId'>) {
  return prisma.song.create({
    data: {
      ...song,
      bandId
    }
  })
}

export async function deleteSong(songId: Song['id']) {
  return prisma.song.delete({
    where: { id: songId },
  })
}

export async function getSongsNotInSetlist(bandId: Band['id'], setlistId: Setlist['id'], params?: { q?: string }) {
  const setlist = await prisma.setlist.findUnique({
    where: { id: setlistId },
    include: {
      sets: {
        include: {
          songs: {
            select: { id: true }
          }
        }
      }
    }
  })
  const songIdsInSetlist = setlist?.sets.reduce((songIds: string[], set) => {
    return [
      ...songIds,
      ...set.songs.reduce((ids: string[], song) => {
        return [...ids, song.id]
      }, [])
    ]
  }, [])
  return prisma.song.findMany({
    where: {
      bandId,
      id: {
        notIn: songIdsInSetlist
      },
      name: {
        contains: params?.q
      },
    }
  })
}

export async function getRecentSongs(bandId: Band['id']) {
  return prisma.song.findMany({
    where: { bandId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })
}