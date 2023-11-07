import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { contrastColor } from "~/utils/assorted";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {});

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const bandIconBackgroundColor = `#000000`;
  const band = await prisma.band.create({
    data: {
      name: "Starter Band",
      code: "123ABC",
      icon: {
        create: {
          backgroundColor: bandIconBackgroundColor,
          textColor: contrastColor(bandIconBackgroundColor),
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      name: "Rachel",
      verified: true,
      bands: {
        // created band above, here created connection between band and user
        create: [
          {
            role: "ADMIN",
            band: {
              connect: {
                id: band.id,
              },
            },
            bandName: band.name,
          },
        ],
      },
    },
  });

  const setlist = await prisma.setlist.create({
    data: {
      name: "My First Setlist",
      bandId: band.id,
    },
  });

  const set = await prisma.set.create({
    data: {
      setlistId: setlist.id,
      positionInSetlist: 0,
    },
  });
  const songOne = await prisma.song.create({
    data: {
      name: "Song One",
      length: 3,
      keyLetter: "Db",
      isMinor: true,
      tempo: 2,
      position: "opener",
      rank: "include",
      sets: {
        create: [
          {
            positionInSet: 0,
            set: {
              connect: { id: set.id },
            },
          },
        ],
      },
      bandId: band.id,
    },
  });
  await prisma.song.create({
    data: {
      name: "Song Two",
      length: 4,
      tempo: 3,
      position: "closer",
      rank: "no_preference",
      sets: {
        create: [
          {
            positionInSet: 1,
            set: {
              connect: { id: set.id },
            },
          },
        ],
      },
      bandId: band.id,
      isCover: true,
    },
  });

  await prisma.feel.create({
    data: {
      label: "Swing",
      color: "#2a9d8f",
      bandId: band.id,
      songs: {
        connect: [{ id: songOne.id }],
      },
    },
  });

  await prisma.feel.create({
    data: {
      label: "Rock",
      color: "#080808",
      bandId: band.id,
      songs: {
        connect: [{ id: songOne.id }],
      },
    },
  });

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
