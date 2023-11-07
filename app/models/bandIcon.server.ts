import type { Band, BandIcon } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getBandIcon(bandId: BandIcon["bandId"]) {
  return prisma.bandIcon.findUnique({
    where: { bandId },
  });
}

export async function updateBandIcon(
  bandId: Band["id"],
  icon: Partial<BandIcon>,
) {
  return prisma.bandIcon.update({
    where: { bandId },
    data: icon,
  });
}
