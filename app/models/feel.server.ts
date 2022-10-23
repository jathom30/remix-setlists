import type { Band, Feel } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getFeels(bandId: Band['id']) {
  return prisma.feel.findMany({
    where: { bandId },
  })
}

export async function createFeel(label: Feel['label'], bandId: Feel['bandId']) {
  // https://css-tricks.com/snippets/javascript/random-hex-color/
  const randomColor = (): string => {
    const hex = `#${Math.floor(Math.random() * 16777215).toString(16)}`
    if (hex.length !== 7) {
      return randomColor()
    }
    return hex
  };

  return prisma.feel.create({
    data: { label, bandId, color: randomColor() }
  })
}