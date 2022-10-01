import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { contrastColor, generateRandomHex } from "~/utils/assorted";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {

  })

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const bandIconBackgroundColor = `#${generateRandomHex()}`
  const band = await prisma.band.create({
    data: {
      name: 'Starter Band',
      code: '123ABC',
      icon: {
        create: {
          backgroundColor: bandIconBackgroundColor,
          textColor: contrastColor(bandIconBackgroundColor)
        }
      }
    },
  })

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      name: 'Rachel',
      bands: {
        // created band above, here created connection between band and user
        create: [
          {
            role: 'ADMIN',
            band: {
              connect: {
                id: band.id,
              }
            },
            bandName: band.name
          }
        ]
      }
    },
  });

  const setlist = await prisma.setlist.create({
    data: {
      name: 'My First Setlist',
      updatedBy: user.email,
      bandId: band.id
    }
  })

  const set = await prisma.set.create({
    data: {
      setlistId: setlist.id,
    }
  })
  const songOne = await prisma.song.create({
    data: {
      name: 'Song One',
      length: 3,
      keyLetter: 'Db',
      isMinor: true,
      tempo: 2,
      position: 'opener',
      rank: 'include',
      sets: {
        connect: {
          id: set.id,
        }
      },
      bandId: band.id,
    }
  })
  await prisma.song.create({
    data: {
      name: 'Song Two',
      length: 4,
      tempo: 3,
      position: 'closer',
      rank: 'no_preference',
      sets: {
        connect: {
          id: set.id
        }
      },
      bandId: band.id,
      isCover: true,
    }
  })

  await prisma.feel.create({
    data: {
      label: 'Swing',
      songId: songOne.id,
      color: '#2a9d8f',
      bandId: band.id
    }
  })

  await prisma.feel.create({
    data: {
      label: 'Rock',
      songId: songOne.id,
      color: '#080808',
      bandId: band.id
    }
  })

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

