import type { Band, User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getBands(userId: User['id']) {
  return prisma.band.findMany({
    where: {
      members: {
        some: {
          userId
        }
      }
    },
    include: { icon: true }
  })
}

export async function getBand(bandId: Band['id']) {
  return prisma.band.findUnique({
    where: { id: bandId },
    include: { icon: true },
  })
}

export async function createBand(band: Pick<Band, 'name' | 'code'>, userId: User['id']) {
  const { name, code } = band
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
            }
          }
        ]
      }
    }
  })
}
