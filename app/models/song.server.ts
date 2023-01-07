import type { Band, Feel, Setlist, Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";
import { getFields } from "~/utils/form";
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

// ! not sure if this is a hack or not. making sure selected song belongs to selected band
export async function getSong(songId: Song['id'], bandId: Song['bandId'], includeSets?: boolean) {
  if (!bandId) { return }
  const song = await prisma.band.findUnique({
    where: { id: bandId },
    select: {
      song: { where: { id: songId }, include: { feels: true, sets: includeSets } }
    }
  })
  if (!song) { return }
  return song?.song[0]
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

export const handleSongFormData = (formData: FormData) => {
  const { fields, errors } = getFields<SerializeFrom<Song & { feels: Feel['id'][] }>>(formData, [
    { name: 'name', type: 'string', isRequired: true },
    { name: 'length', type: 'number', isRequired: true },
    { name: 'keyLetter', type: 'string', isRequired: false },
    { name: 'isMinor', type: 'boolean', isRequired: false },
    { name: 'tempo', type: 'number', isRequired: true },
    { name: 'position', type: 'string', isRequired: true },
    { name: 'rank', type: 'string', isRequired: true },
    { name: 'note', type: 'string', isRequired: false },
  ])
  const feels = formData.getAll('feels')
  const isCover = formData.get('isCover')

  const errorsWithFeels = { ...errors, ...(!Array.isArray(feels) ? { feels: 'Invalid feels' } : {}) }

  if (Object.keys(errorsWithFeels).length) {
    return { errors: errorsWithFeels, formFields: null, validFeels: null }
  }

  const validFeels = feels.reduce((acc: string[], feelId) => {
    if (feelId.toString().length) {
      return [
        ...acc, feelId.toString()
      ]
    }
    return acc
  }, [])

  return { errors: null, formFields: { ...fields, isCover: !!isCover }, validFeels }
}