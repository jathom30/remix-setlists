import { prisma } from "~/db.server";

export async function getTempBand(bandName: string) {
  return prisma.band.findFirst({
    where: { name: bandName }
  })
}