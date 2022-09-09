import type { Band, Feel } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getFeels(bandId: Band['id']) {
  return prisma.feel.findMany({
    where: { bandId },
  })
}

export async function createFeelWithSong(feel: Omit<Feel, 'id' | 'createdAt' | 'updatedAt'>) {
  return prisma.feel.create({
    data: feel
  })
}