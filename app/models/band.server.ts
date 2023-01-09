import type { Band, BandIcon, User } from "@prisma/client";
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

export async function getBandMembers(bandId: Band['id']) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    select: { members: true }
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

export async function updateBand(bandId: Band['id'], band: { name: Band['name'], backgroundColor: BandIcon['backgroundColor'], path?: BandIcon['path'] }) {
  return prisma.band.update({
    where: { id: bandId },
    data: {
      name: band.name,
      icon: {
        update: {
          ...(band.path ? { path: band.path } : null),
          backgroundColor: band.backgroundColor,
          textColor: contrastColor(band.backgroundColor || '')
        }
      }
    }
  })
}

export async function updateBandCode(bandId: Band['id']) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  return prisma.band.update({
    where: { id: bandId },
    data: { code }
  })
}

export async function updateBandByCode(code: Band['code'], userId: User['id']) {
  const band = await prisma.band.findFirst({
    where: { code },
  })
  if (!band) {
    throw new Response('Band not found', { status: 404 })
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bands: true }
  })
  if (user?.bands.some(b => b.bandId === band.id)) {
    throw new Error('User already in band')
  }
  await prisma.user.update({
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
  return band
}

export async function deleteBand(bandId: Band['id']) {
  await prisma.band.delete({
    where: { id: bandId }
  })
}
