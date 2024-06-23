import type { Band, Feel, Setlist, Song } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { z } from "zod";

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
  // const coversOnly = params?.isCover;
  // const originalsOnly = typeof params?.isCover === "boolean" && !params.isCover;
  const orderBy = getSortFromParam(params?.sort);
  return prisma.song.findMany({
    where: {
      bandId,
      name: {
        contains: params?.q,
      },
      // ...(coversOnly ? { author: { not: band.name } } : null),
      // ...(originalsOnly ? { author: { equals: band.name } } : null),
      // ...(params?.feels?.length
      //   ? { feels: { some: { id: { in: params?.feels } } } }
      //   : null),
      // ...(params?.tempos?.length ? { tempo: { in: params.tempos } } : null),
      // ...(params?.positions?.length
      //   ? { position: { in: params.positions } }
      //   : null),
    },
    orderBy,
  });
}

export async function getRecentSongs(bandId: Band["id"]) {
  return prisma.song.findMany({
    where: { bandId },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
}

// ! not sure if this is a hack or not. making sure selected song belongs to selected band
export async function getSong(
  songId: Song["id"],
  bandId: Band["id"],
  includeSets?: boolean,
) {
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
  return { song: song?.song[0], setlists: song?.setlists };
}

export async function getSongName(songId: Song["id"]) {
  return prisma.song.findUnique({
    where: { id: songId },
    select: { name: true },
  });
}

export const EditSongSchema = z.object({
  name: z.string().min(1),
  length: z.coerce.number().min(1).default(3),
  keyLetter: z.string().min(1).max(2).default("C"),
  isMinor: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean()),
  tempo: z.coerce.number().min(1).max(320).default(120),
  feels: z.array(z.string()),
  author: z.string().nullish(),
  note: z.string().nullish(),
  links: z.array(
    z
      .string()
      .refine(
        (value) =>
          /^(https?):\/\/(?=.*\.[a-z]{2,})[^\s$.?#].[^\s]*$/i.test(value),
        {
          message: "Please enter a valid URL",
        },
      ),
  ),
  position: z.enum(["opener", "closer", "other"]).default("other"),
  rank: z.enum(["exclude", "no_preference"]).default("no_preference"),
  isCover: z.boolean().default(false),
  showTempo: z.coerce.boolean().default(false),
});

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

export async function updateSongWithLinksAndFeels(
  songId: Song["id"],
  song: z.infer<typeof EditSongSchema>,
) {
  // remove all links from song
  await prisma.link.deleteMany({
    where: {
      songId,
    },
  });

  // update feels
  const currentFeelIds = (
    await prisma.song.findUnique({
      where: { id: songId },
      include: { feels: { select: { id: true } } },
    })
  )?.feels.map((feel) => feel.id);

  const newFeels =
    song.feels.filter((feelId) => !currentFeelIds?.includes(feelId)) || [];
  const removedFeels =
    currentFeelIds?.filter((feelId) => !song.feels.includes(feelId)) || [];

  return prisma.song.update({
    where: { id: songId },
    data: {
      name: song.name,
      length: song.length,
      keyLetter: song.keyLetter,
      isMinor: song.isMinor,
      tempo: song.showTempo ? song.tempo : null,
      position: song.position,
      rank: song.rank,
      note: song.note,
      author: song.author,
      // add links back to song
      links: {
        create: song.links.map((link) => ({ href: link })),
      },
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

export async function createSongWithFeels(
  bandId: Band["id"],
  song: Omit<Song, "id" | "updatedAt" | "createdAt" | "bandId"> & {
    feels: Feel["id"][];
    links?: string[];
  },
) {
  return prisma.song.create({
    data: {
      ...song,
      bandId,
      links: {
        create: song.links?.map((link) => ({ href: link })),
      },
      feels: {
        connect: song.feels.map((feelId) => ({ id: feelId })),
      },
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
