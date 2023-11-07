import type { Link, Song } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getLinks(songId: Song["id"]) {
  return prisma.link.findMany({
    where: { songId },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertLink(
  link: Pick<Link, "href" | "songId">,
  linkId?: Link["id"],
) {
  return prisma.link.upsert({
    where: {
      id: linkId || "",
    },
    create: {
      href: link.href,
      songId: link.songId,
    },
    update: {
      href: link.href,
      songId: link.songId,
    },
  });
}

export async function deleteLink(linkId: Link["id"]) {
  return prisma.link.delete({ where: { id: linkId } });
}
