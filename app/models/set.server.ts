import type { Set, Setlist, Song } from "@prisma/client";
import { prisma } from "~/db.server";
import { getBand } from "./band.server";
import { getSetlist } from "./setlist.server";

export async function removeSongFromSet(setId: Set["id"], songId: Song["id"]) {
  const updatedSet = await prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        delete: { songId_setId: { setId, songId } },
      },
    },
    include: { songs: true },
  });
  if (updatedSet.songs.length === 0) {
    return deleteSet(updatedSet.id);
  }
  return updatedSet;
}

export async function getSetLength(songIds: Song["id"][]) {
  const songLengths = await prisma.song.findMany({
    where: { id: { in: songIds } },
    select: { length: true },
  });
  return songLengths.reduce((total, song) => (total += song.length), 0);
}

export async function getSet(setId: Set["id"]) {
  return prisma.set.findUnique({
    where: { id: setId },
    include: { songs: true },
  });
}

export async function getSetMetrics(setId: Set["id"]) {
  const set = await prisma.set.findUnique({
    where: { id: setId },
    include: { songs: { include: { song: { include: { feels: true } } } } },
  });
  if (!set) {
    throw new Response("Set not found", { status: 404 });
  }
  const setlist = await getSetlist(set.setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  const band = await getBand(setlist.bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const bandName = band.name;
  const numberOfOriginalSongs =
    set.songs.filter((song) => song.song?.author === bandName).length || 0;
  const numberOfCoverSongs =
    set.songs.filter((song) =>
      song.song?.author ? song.song.author !== bandName : false,
    ).length || 0;
  const numberOfSongsWithoutAuthor =
    set.songs.filter((song) => !song.song?.author).length || 0;

  const feels = set.songs.map((song) => song.song?.feels).flat();
  const tempos = set.songs.map((song) => song.song?.tempo || 0) || [];

  return {
    songs: set?.songs,
    feels,
    tempos,
    numberOfCoverSongs,
    numberOfOriginalSongs,
    numberOfSongsWithoutAuthor,
  };
}

export async function addSongsToSet(setId: Set["id"], songIds: Song["id"][]) {
  const set = await getSet(setId);
  const lastSongPosition =
    set?.songs.reduce((highestPosition, song) => {
      if (song.positionInSet > highestPosition) {
        return song.positionInSet;
      }
      return highestPosition;
    }, 0) || 0;
  return prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        create: songIds.map((songId, index) => ({
          songId,
          positionInSet: index + lastSongPosition,
        })),
      },
    },
  });
}

export async function createSet(
  setlistId: Setlist["id"],
  songIds: Song["id"][],
  positionInSetlist: Set["positionInSetlist"],
) {
  return prisma.set.create({
    data: {
      setlistId,
      positionInSetlist,
      songs: {
        create: songIds.map((songId, index) => ({
          songId,
          positionInSet: index,
        })),
      },
    },
  });
}

export async function updateSetPosition(
  setId: Set["id"],
  positionInSetlist: Set["positionInSetlist"],
) {
  return prisma.set.update({
    where: { id: setId },
    data: { positionInSetlist },
  });
}

export async function updateSetSongs(setId: Set["id"], songIds?: Song["id"][]) {
  const cleanedSongIds = songIds?.reduce(
    (acc, songId) => (songId.length ? [...acc, songId] : acc),
    [] as string[],
  );
  const hasSongs = (cleanedSongIds?.length ?? 0) > 0;
  if (!hasSongs) {
    return prisma.set.update({
      where: { id: setId },
      data: { songs: { deleteMany: {} } },
    });
  }

  return prisma.set.update({
    where: { id: setId },
    data: {
      songs: {
        deleteMany: {},
        create: cleanedSongIds?.map((songId, index) => ({
          songId,
          positionInSet: index,
        })),
      },
    },
  });
}

export async function deleteSet(setId: Set["id"]) {
  return prisma.set.delete({
    where: { id: setId },
  });
}
