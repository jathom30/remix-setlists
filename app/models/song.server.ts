import type { Band, Feel, Setlist, Song } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";
import { getFields } from "~/utils/form";
import { getSortFromParam } from "~/utils/params";

import { getBand } from "./band.server";

interface SongParams {
  q?: string;
  tempos?: Song["tempo"][];
  isCover?: boolean;
  feels?: Feel["id"][];
  positions?: Song["position"][];
  sort?: string;
}

export async function getSongs(bandId: Band["id"], params?: SongParams) {
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const coversOnly = params?.isCover;
  const originalsOnly = typeof params?.isCover === "boolean" && !params.isCover;
  const orderBy = getSortFromParam(params?.sort);
  return prisma.song.findMany({
    where: {
      bandId,
      name: {
        contains: params?.q,
      },
      ...(coversOnly ? { author: { not: band.name } } : null),
      ...(originalsOnly ? { author: { equals: band.name } } : null),
      ...(params?.feels?.length
        ? { feels: { some: { id: { in: params?.feels } } } }
        : null),
      ...(params?.tempos?.length ? { tempo: { in: params.tempos } } : null),
      ...(params?.positions?.length
        ? { position: { in: params.positions } }
        : null),
    },
    orderBy,
  });
}

// ! not sure if this is a hack or not. making sure selected song belongs to selected band
export async function getSong(
  songId: Song["id"],
  bandId: Song["bandId"],
  includeSets?: boolean,
) {
  if (!bandId) {
    return;
  }
  const song = await prisma.band.findUnique({
    where: { id: bandId },
    select: {
      song: {
        where: { id: songId },
        include: { feels: true, sets: includeSets, links: true },
      },
      setlists: {
        where: { sets: { some: { songs: { some: { songId } } } } },
        select: { name: true, id: true, editedFromId: true },
      },
    },
  });
  if (!song) {
    return;
  }
  return { song: song?.song[0], setlists: song.setlists };
}

export async function getSongName(songId: Song["id"]) {
  return prisma.song.findUnique({
    where: { id: songId },
    select: { name: true },
  });
}

export async function updateSong(
  songId: Song["id"],
  song: Omit<Song, "id" | "updatedAt" | "createdAt">,
  feelIds: Feel["id"][],
) {
  const currentFeelIds = (
    await prisma.song.findUnique({
      where: { id: songId },
      include: { feels: { select: { id: true } } },
    })
  )?.feels.map((feel) => feel.id);

  const newFeels =
    feelIds.filter((feelId) => !currentFeelIds?.includes(feelId)) || [];
  const removedFeels =
    currentFeelIds?.filter((feelId) => !feelIds.includes(feelId)) || [];

  return prisma.song.update({
    where: { id: songId },
    data: {
      ...song,
      feels: {
        disconnect: removedFeels.map((feel) => ({ id: feel })),
        connect: newFeels.map((feel) => ({ id: feel })),
      },
    },
  });
}

export async function createSong(
  bandId: Band["id"],
  song: Omit<Song, "id" | "updatedAt" | "createdAt" | "bandId">,
  feelIds: Feel["id"][],
) {
  return prisma.song.create({
    data: {
      ...song,
      bandId,
      ...(feelIds.length
        ? {
            feels: {
              connect: feelIds.map((feelId) => ({ id: feelId })),
            },
          }
        : {}),
    },
  });
}

export async function deleteSong(songId: Song["id"]) {
  return prisma.song.delete({
    where: { id: songId },
  });
}

export async function getSongsNotInSetlist(
  bandId: Band["id"],
  setlistId: Setlist["id"],
  params?: { q?: string },
) {
  const setlist = await prisma.setlist.findUnique({
    where: { id: setlistId },
    include: {
      sets: {
        include: {
          songs: {
            select: { songId: true },
          },
        },
      },
    },
  });
  const songIdsInSetlist = setlist?.sets.reduce((songIds: string[], set) => {
    return [
      ...songIds,
      ...set.songs.reduce((ids: string[], song) => {
        return [...ids, song.songId];
      }, []),
    ];
  }, []);
  return prisma.song.findMany({
    where: {
      bandId,
      id: {
        notIn: songIdsInSetlist,
      },
      name: {
        contains: params?.q,
      },
    },
    orderBy: { name: "asc" },
  });
}

export const handleSongFormData = (formData: FormData) => {
  const { fields, errors } = getFields<
    SerializeFrom<Song & { feels: Feel["id"][] }>
  >(formData, [
    { name: "name", type: "string", isRequired: true },
    { name: "length", type: "number", isRequired: true },
    { name: "keyLetter", type: "string", isRequired: false },
    { name: "isMinor", type: "boolean", isRequired: false },
    { name: "tempo", type: "number", isRequired: true },
    { name: "position", type: "string", isRequired: true },
    { name: "rank", type: "string", isRequired: true },
    { name: "note", type: "string", isRequired: false },
    { name: "author", type: "string", isRequired: false },
  ]);
  const feels = formData.getAll("feels");
  const entries = formData.entries();

  const newLinks: { id?: string; href: string }[] = [];
  const existingLinks: { id: string; href: string }[] = [];
  const invalidLinkIds: string[] = [];
  function validateURL(url: string) {
    const regex =
      /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
  }
  for (const entry of entries) {
    if (entry[0].includes("links")) {
      if (typeof entry[1] !== "string") {
        throw new Response("Invalid external links", { status: 401 });
      }

      // remove http from string so it gets saved without it and doesn't mess with UI
      const webAddress = entry[1]
        .toString()
        .replace("http://", "")
        .replace("https://", "");
      // add it back for regex validation
      if (webAddress && !validateURL("https://" + webAddress)) {
        invalidLinkIds.push(
          entry[0].replace("links/", "").replace("temp/", ""),
        );
      }
      if (entry[0].includes("temp")) {
        if (entry[1].length) {
          newLinks.push({ href: webAddress });
        }
      } else {
        existingLinks.push({
          id: entry[0].replace("links/", ""),
          href: webAddress,
        });
      }
    }
  }

  const links = [...existingLinks, ...newLinks];
  const deletedLinks = formData
    .getAll("deletedLinks")
    .map((id) => id.toString());
  const errorsWithFeels = {
    ...errors,
    ...(!Array.isArray(feels) ? { feels: "Invalid feels" } : {}),
    ...(invalidLinkIds.length > 0 ? { links: invalidLinkIds } : null),
  };

  if (Object.keys(errorsWithFeels).length) {
    return {
      errors: errorsWithFeels,
      formFields: null,
      validFeels: null,
      links: null,
    };
  }

  const validFeels = feels.reduce((acc: string[], feelId) => {
    if (feelId.toString().length) {
      return [...acc, feelId.toString()];
    }
    return acc;
  }, []);

  return { errors: null, formFields: fields, validFeels, links, deletedLinks };
};

export async function getSongSetlists(songId: Song["id"]) {
  const songWithSets = await prisma.song.findUnique({
    where: { id: songId },
    include: { sets: { select: { setId: true } } },
  });
  const setIds = songWithSets?.sets.map((set) => set.setId);
  return (
    await prisma.setlist.findMany({
      where: { sets: { some: { id: { in: setIds } } } },
      select: { name: true, id: true, editedFromId: true },
    })
  )?.filter((setlist) => !setlist.editedFromId);
}
