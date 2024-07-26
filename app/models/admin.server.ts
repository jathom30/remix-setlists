import { prisma } from "~/db.server";

export async function getVerifiedUsers() {
  return prisma.user.findMany({
    where: {
      verified: true,
    },
    include: {
      bands: {
        include: {
          band: {
            include: {
              // setlists: {
              //   include: {
              //     sets: {
              //       include: {
              //         songs: true
              //       }
              //     },
              //   },
              // },
              song: {
                include: {
                  feels: true,
                },
              },
              feels: {
                include: {
                  songs: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
