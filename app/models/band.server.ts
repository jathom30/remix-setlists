import type { Band, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { contrastColor, generateRandomHex } from "~/utils/assorted";

export async function getBands(userId: User['id']) {
  return prisma.band.findMany({
    where: {
      members: {
        some: {
          userId
        }
      },
    },
    include: {
      icon: true,
      members: {
        where: { userId },
        select: { role: true }
      }
    }
  })
}

export async function getBand(bandId: Band['id']) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    include: { icon: true, members: true },
  })
}

export async function createBand(band: Pick<Band, 'name'>, userId: User['id']) {
  const { name } = band
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const backgroundColor = `#${generateRandomHex()}`
  const textColor = contrastColor(backgroundColor)
  return prisma.band.create({
    data: {
      name,
      code,
      members: {
        create: [
          {
            role: 'ADMIN',
            user: {
              connect: {
                id: userId
              }
            },
            bandName: name
          }
        ]
      },
      icon: {
        create: {
          textColor,
          backgroundColor,
        }
      }
    }
  })
}

export async function updateBand(bandId: Band['id'], band: Partial<Band>) {
  return prisma.band.update({
    where: { id: bandId },
    data: band
  })
}
