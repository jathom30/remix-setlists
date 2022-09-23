import type { Band, Song } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getSongs(bandId: Band['id'], params?: { q?: string }) {
  return prisma.song.findMany({
    where: {
      bandId,
      ...(params?.q ? {
        name: {
          contains: params.q
        }
      } : null)
    },

    orderBy: { name: 'asc' }
  })
}

export async function getSong(songId: Song['id']) {
  return prisma.song.findUnique({
    where: { id: songId },
    include: { feels: true }
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
    where: { id: songId }
  })
}