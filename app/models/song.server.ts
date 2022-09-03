import type { Band } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getSongs(bandId: Band['id']) {
  return prisma.song.findMany({
    where: { bandId },
    orderBy: { name: 'asc' }
  })
}