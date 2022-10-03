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
    select: {
      id: true,
      name: true,
      icon: true,
      members: {
        where: { userId },
        select: { role: true }
      }
    }
  })
}

export async function getBandHome(bandId: Band['id']) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    select: {
      icon: true,
      name: true,
    }
  })
}

export async function getBand(bandId: Band['id']) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    include: { icon: true, members: true },
  })
}

export async function getBandName(bandId: Band['id']) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    select: { name: true }
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

export async function updateBandByCode(code: Band['code'], userId: User['id']) {
  const band = await prisma.band.findFirst({
    where: { code },
  })
  if (!band) {
    throw new Error('Band not found')
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bands: true }
  })
  if (user?.bands.some(b => b.bandId === band.id)) {
    throw new Error('User already in band')
  }
  return prisma.user.update({
    where: { id: userId },
    data: {
      bands: {
        create: [{
          role: 'SUB',
          band: {
            connect: { id: band.id },
          },
          bandName: band.name
        }]
      }
    }
  })
}

export async function deleteBand(bandId: Band['id']) {
  await prisma.band.delete({
    where: { id: bandId }
  })
}