import type { Band } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getSetlists(bandId: Band['id']) {
  return prisma.setlist.findMany({
    where: { bandId },
    select: { name: true, updatedAt: true, updatedBy: true, id: true },
    orderBy: { updatedAt: 'asc' },
  })
}