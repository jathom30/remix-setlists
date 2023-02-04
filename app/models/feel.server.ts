import type { Band, Feel } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getFeels(bandId: Band['id']) {
  return prisma.feel.findMany({
    where: { bandId },
    orderBy: { label: 'asc' },
    include: { songs: { select: { id: true } } }
  })
}

export async function getMostRecentFeels(bandId: Band['id']) {
  return prisma.feel.findMany({
    where: { bandId },
    orderBy: { updatedAt: 'desc' },
    include: { songs: { select: { id: true } } },
    take: 5,
  })

}

export async function getFeel(feelId: Feel['id']) {
  return prisma.feel.findUnique({
    where: { id: feelId }
  })
}

export async function createFeel(label: Feel['label'], bandId: Feel['bandId'], color?: Feel['color']) {
  // https://css-tricks.com/snippets/javascript/random-hex-color/
  const randomColor = (): string => {
    const hex = `#${Math.floor(Math.random() * 16777215).toString(16)}`
    if (hex.length !== 7) {
      return randomColor()
    }
    return hex
  };

  return prisma.feel.create({
    data: { label, bandId, color: color ?? randomColor() }
  })
}

export async function deleteFeel(feelId: Feel['id']) {
  return prisma.feel.delete({
    where: { id: feelId }
  })
}

export async function updateFeel(feelId: Feel['id'], feel: Partial<Feel>) {
  return prisma.feel.update({
    where: { id: feelId },
    data: feel
  })
}