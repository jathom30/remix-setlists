import type { Band, Setlist, Song } from "@prisma/client";

import { prisma } from "~/db.server";
import { getSortFromParam } from "~/utils/params";
import type { SetlistSettings } from "~/utils/setlists";
import {
  createRandomSetsByPosition,
  setOfLength,
  sortSetsByPosition,
} from "~/utils/setlists";

import { createSet } from "./set.server";
import { getSongs } from "./song.server";

export async function createSetlist(bandId: Band["id"], songIds: Song["id"][]) {
  return await prisma.setlist.create({
    data: {
      name: "Temp name",
      bandId,
      sets: {
        create: [
          {
            songs: {
              create: songIds.map((songId, index) => ({
                songId,
                positionInSet: index,
              })),
            },
          },
        ],
      },
    },
  });
}

export async function getSetlists(
  bandId: Band["id"],
  params?: { q?: string; sort?: string },
) {
  const orderBy = getSortFromParam(params?.sort);
  const setlists = await prisma.setlist.findMany({
    where: {
      bandId,
      name: {
        contains: params?.q,
      },
    },
    include: {
      sets: {
        select: {
          songs: { include: { song: { select: { length: true } } } },
          updatedAt: true,
        },
      },
    },
    orderBy,
  });
  return setlists;
}

export async function getRecentSetlists(bandId: Band["id"]) {
  return prisma.setlist.findMany({
    where: { bandId },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
}

export async function getSetlist(setlistId: Setlist["id"]) {
  return prisma.setlist.findUnique({
    where: { id: setlistId },
    include: {
      sets: {
        include: {
          songs: { include: { song: true }, orderBy: { positionInSet: "asc" } },
        },
        orderBy: { positionInSetlist: "asc" },
      },
    },
  });
}

export async function getCondensedSetlist(setlistId: Setlist["id"]) {
  return prisma.setlist.findUnique({
    where: { id: setlistId },
    include: {
      sets: {
        include: {
          songs: {
            include: { song: { select: { name: true, length: true } } },
            orderBy: { positionInSet: "asc" },
          },
        },
      },
    },
  });
}

export async function getPublicSetlist(setlistId: Setlist["id"]) {
  const setlist = await prisma.setlist.findUnique({
    where: { id: setlistId },
    select: {
      name: true,
      isPublic: true,
      sets: {
        include: {
          songs: {
            include: { song: { select: { name: true, length: true } } },
            orderBy: { positionInSet: "asc" },
          },
        },
        orderBy: { positionInSetlist: "asc" },
      },
    },
  });
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  if (!setlist.isPublic) {
    throw new Response("Setlist not public", { status: 403 });
  }
  return setlist;
}

export async function getSetlistName(setlistId: Setlist["id"]) {
  return prisma.setlist.findUnique({
    where: { id: setlistId },
    select: { name: true },
  });
}

export async function updateSetlist(
  setlistId: Setlist["id"],
  setlist: Partial<Setlist>,
) {
  const currentSetlist = await getSetlist(setlistId);
  if (!currentSetlist) {
    return;
  }
  await Promise.all(
    currentSetlist.sets.map(async (set, i) => {
      // if set has no songs, delete and update position
      if (set.songs.length === 0) {
        return await prisma.set.delete({ where: { id: set.id } });
      }
      // replace with sets from cloned setlist
      return await prisma.set.update({
        where: { id: set.id },
        data: { positionInSetlist: i },
      });
    }),
  );
  return prisma.setlist.update({
    where: { id: setlistId },
    data: setlist,
  });
}

export async function deleteSetlist(setlistId: Setlist["id"]) {
  return prisma.setlist.delete({
    where: { id: setlistId },
  });
}

export async function deleteManySetlists(ids: Setlist["id"][]) {
  return await prisma.setlist.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function deleteUnneededClonedSetlists(bandId: Setlist["bandId"]) {
  // get all setlists of a band
  const setlists = await prisma.setlist.findMany({
    where: { bandId },
    select: { id: true, editedFromId: true },
  });
  // filter to only setlists with an editedFromId
  const clonedSetlists = setlists.filter((setlist) => !!setlist.editedFromId);
  if (!clonedSetlists.length) return;
  // delete all those setlists
  return await deleteManySetlists(clonedSetlists.map((setlist) => setlist.id));
}

export async function createSetlistAuto(
  bandId: Band["id"],
  settings: SetlistSettings,
) {
  const { filters, setCount, setLength } = settings;
  const { noBallads, noCovers, onlyCovers } = filters;
  // sets need a setlistId
  const setlist = await prisma.setlist.create({
    data: {
      name: "Auto-magical temp name",
      bandId,
    },
  });
  // const setlistId = setlist.id
  // get all songs filtered based on filter params
  const params = {
    ...(noBallads ? { tempos: [2, 3, 4, 5] } : null),
    ...(noCovers ? { isCover: false } : null),
    ...(onlyCovers ? { isCover: true } : null),
  };
  const songs = await getSongs(bandId, params);
  // remove excluded songs from pool
  const withoutExcludedSongs = songs.filter((song) => song.rank !== "exclude");
  // split songs into sets by position so each desired set has an even distribution of openers and closers
  const setsByPosition = createRandomSetsByPosition(
    withoutExcludedSongs,
    setCount,
  );

  // trim above sets to desired minute length and sort songs so sets start with openers and end with closers
  const setsByLength = Object.keys(setsByPosition).reduce(
    (sets: Record<string, Song[]>, key) => ({
      ...sets,
      [key]: setOfLength(setsByPosition[key], setLength),
    }),
    {},
  );

  // sort by position
  const sortedByPosition = sortSetsByPosition(setsByLength);

  // create sets in db
  Object.values(sortedByPosition).forEach(async (songs, i) => {
    await createSet(
      setlist.id,
      songs.map((song) => song.id),
      i,
    );
  });

  return setlist.id;
}

// cloned setlist is created when editing
// cloned setlist is manipulated, upon saving, use editedFromId to overwrite OG setlist
export async function cloneSetlist(setlistId: Setlist["id"]) {
  const originalSetlist = await getSetlist(setlistId);
  if (!originalSetlist) {
    return null;
  }
  // destroy any setlists that may have been cloned previously, but abandoned during editing
  const oldSetlist = await prisma.setlist.findFirst({
    where: { editedFromId: originalSetlist.id },
  });
  if (oldSetlist) {
    deleteSetlist(oldSetlist.id);
  }
  return prisma.setlist.create({
    data: {
      name: originalSetlist.name,
      bandId: originalSetlist.bandId,
      editedFromId: originalSetlist.id,
      sets: {
        create: originalSetlist?.sets.map((set) => ({
          songs: {
            create: set.songs.map((song) => ({
              songId: song.songId,
              positionInSet: song.positionInSet,
            })),
          },
        })),
      },
    },
  });
}

export async function overwriteSetlist(clonedSetlistId: string) {
  const clonedSetlist = await getSetlist(clonedSetlistId);
  if (!clonedSetlist?.editedFromId) {
    return;
  }
  const originalSetlist = await getSetlist(clonedSetlist.editedFromId);
  if (!originalSetlist) return;
  // delete sets from OG setlist
  await prisma.set.deleteMany({ where: { setlistId: originalSetlist?.id } });
  await Promise.all(
    clonedSetlist.sets.map(async (set, i) => {
      // if set has no songs, delete and update position
      if (set.songs.length === 0) {
        return await prisma.set.delete({ where: { id: set.id } });
      }
      // replace with sets from cloned setlist
      return await prisma.set.update({
        where: { id: set.id },
        data: {
          setlistId: originalSetlist.id,
          positionInSetlist: i,
        },
      });
    }),
  );
  // delete cloned setlist
  await deleteSetlist(clonedSetlistId);
  return originalSetlist?.id;
}
