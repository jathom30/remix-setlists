import type { Band, User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function updateBandMemberRole(bandId: Band['id'], memberId: User['id'], role: string) {
  return prisma.usersInBands.update({
    where: {
      userId_bandId: {
        userId: memberId, bandId
      }
    },
    data: { role }
  })
}

export async function getMemberRole(bandId: Band['id'], userId: User['id']) {
  const band = await prisma.usersInBands.findUnique({
    where: { userId_bandId: { userId, bandId } }
  })
  return band?.role || 'SUB'
}

export async function removeMemberFromBand(bandId: Band['id'], userId: User['id']) {
  return prisma.usersInBands.delete({
    where: { userId_bandId: { userId, bandId } }
  })
}

export async function getUserBands(userId: User['id']) {
  return prisma.usersInBands.findMany({
    where: { userId },
    select: { bandId: true }
  })
}