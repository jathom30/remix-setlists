import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const band = await prisma.band.create({
    data: {
      name: 'Starter Band',
      code: '123-ABC',
      icon: {
        create: {
          backgroundColor: '#C7FFDA',
          textColor: '#7B1E7A'
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
                id: band.id
              }
            }
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
      position: 'Opener',
      rank: 'star',
      setId: set.id,
      bandId: band.id,
    }
  })
  await prisma.song.create({
    data: {
      name: 'Song Two',
      length: 4,
      tempo: 3,
      position: 'Closer',
      setId: set.id,
      bandId: band.id,
    }
  })

  await prisma.feel.create({
    data: {
      label: 'Swing',
      songId: songOne.id,
      color: '#2a9d8f'
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

