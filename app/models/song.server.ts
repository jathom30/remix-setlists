import type { Band, Feel, Setlist, Song } from "@prisma/client";
import { prisma } from "~/db.server";
import { getSortFromParam } from "~/utils/params";

type SongParams = {
  q?: string
  tempos?: Song['tempo'][]
  isCover?: Song['isCover']
  feels?: Feel['id'][]
  positions?: Song['position'][]
  sort?: string
}

export async function getSongs(bandId: Band['id'], params?: SongParams) {
  const orderBy = getSortFromParam(params?.sort)
  return prisma.song.findMany({
    where: {
      bandId,
      name: {
        contains: params?.q,
      },
      ...(params?.isCover === false ? { NOT: { isCover: true } } : null),
      ...(params?.isCover === true ? { isCover: true } : null),
      ...(params?.feels?.length ? { feels: { some: { id: { in: params?.feels } } } } : null),
      ...(params?.tempos?.length ? { tempo: { in: params.tempos } } : null),
      ...(params?.positions?.length ? { position: { in: params.positions } } : null),
    },
    orderBy
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

export async function updateSong(songId: Song['id'], song: Omit<Song, 'id' | 'updatedAt' | 'createdAt'>, feelIds: Feel['id'][]) {
  const currentFeelIds = (await prisma.song.findUnique({ where: { id: songId }, include: { feels: { select: { id: true } } } }))?.feels.map(feel => feel.id)

  const newFeels = feelIds.filter(feelId => !currentFeelIds?.includes(feelId)) || []
  const removedFeels = currentFeelIds?.filter(feelId => !feelIds.includes(feelId)) || []

  return prisma.song.update({
    where: { id: songId },
    data: {
      ...song,
      feels: {
        disconnect: removedFeels.map(feel => ({ id: feel })),
        connect: newFeels.map(feel => ({ id: feel })),
      }
    }
  })
}

export async function createSong(bandId: Band['id'], song: Omit<Song, 'id' | 'updatedAt' | 'createdAt' | 'bandId'>, feelIds: Feel['id'][]) {
  return prisma.song.create({
    data: {
      ...song,
      bandId,
      ...(feelIds.length ? {
        feels: {
          connect: feelIds.map(feelId => ({ id: feelId }))
        }
      } : {})
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
            select: { songId: true }
          }
        }
      }
    }
  })
  const songIdsInSetlist = setlist?.sets.reduce((songIds: string[], set) => {
    return [
      ...songIds,
      ...set.songs.reduce((ids: string[], song) => {
        return [...ids, song.songId]
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