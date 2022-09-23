import type { Band, User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function updateBandMemberRole(bandId: Band['id'], memberId: User['id'], role: string) {
  return await prisma.usersInBands.update({
    where: {
      userId_bandId: {
        userId: memberId, bandId
      }
    },
    data: { role }
  })
}
