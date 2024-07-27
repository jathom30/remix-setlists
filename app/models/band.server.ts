import crypto from "crypto";

import type { Band, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { contrastColor, generateRandomHex } from "~/utils/assorted";
import { encrypt } from "~/utils/encryption.server";

export async function getBands(
  userId: User["id"],
  params: { q?: string } = {},
) {
  return prisma.band.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
      name: {
        contains: params.q,
      },
    },
    select: {
      id: true,
      name: true,
      icon: true,
      members: {
        // where: { userId },
        select: { role: true, userId: true },
      },
    },
  });
}

export async function getBandHome(bandId: Band["id"]) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    select: {
      icon: true,
      name: true,
    },
  });
}

export async function getBand(bandId: Band["id"]) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    include: { icon: true, members: true },
  });
}

export async function getBandWithFeels(bandId: Band["id"]) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    include: { feels: true },
  });
}

export async function getBandName(bandId: Band["id"]) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    select: { name: true },
  });
}

export async function getBandMembers(bandId: Band["id"]) {
  return await prisma.band.findUnique({
    where: { id: bandId },
    select: { members: true },
  });
}

export async function createBand(band: Pick<Band, "name">, userId: User["id"]) {
  const { name } = band;
  const code = Math.random().toString(36).substring(2, 8)?.toUpperCase();
  const backgroundColor = `#${generateRandomHex()}`;
  const textColor = contrastColor(backgroundColor);
  return prisma.band.create({
    data: {
      name,
      code,
      members: {
        create: [
          {
            role: "ADMIN",
            user: {
              connect: {
                id: userId,
              },
            },
            bandName: name,
          },
        ],
      },
      icon: {
        create: {
          textColor,
          backgroundColor,
        },
      },
    },
  });
}

export async function updateBand(bandId: Band["id"], band: Partial<Band>) {
  const originalBand = await prisma.band.findUnique({
    where: { id: bandId },
    select: { name: true },
  });
  const updatedBand = await prisma.band.update({
    where: { id: bandId },
    data: band,
  });
  await prisma.song.updateMany({
    where: { bandId, author: originalBand?.name },
    data: {
      author: updatedBand.name,
    },
  });
  return updatedBand;
}

export async function updateBandName(bandId: Band["id"], name: Band["name"]) {
  const originalBand = await prisma.band.findUnique({
    where: { id: bandId },
    select: { name: true },
  });
  await prisma.usersInBands.updateMany({
    where: { bandId },
    data: { bandName: name },
  });
  await prisma.song.updateMany({
    where: { bandId, author: originalBand?.name },
    data: {
      author: name,
    },
  });
  return await prisma.band.update({
    where: { id: bandId },
    data: { name },
  });
}

export async function updateBandCode(bandId: Band["id"]) {
  const code = crypto.randomBytes(32).toString("hex");
  await generateBandToken(bandId, code);
  return prisma.band.update({
    where: { id: bandId },
    data: { code },
  });
}

export async function updateBandByCode(code: Band["code"], userId: User["id"]) {
  const band = await prisma.band.findFirst({
    where: { code },
  });
  if (!band) {
    return { error: "Band not found" };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bands: true },
  });
  if (user?.bands.some((b) => b.bandId === band.id)) {
    return { error: "User already in band" };
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      bands: {
        create: [
          {
            role: "SUB",
            band: {
              connect: { id: band.id },
            },
            bandName: band.name,
          },
        ],
      },
    },
  });
  return band;
}

export async function addUserToBand(userId: User["id"], bandId: Band["id"]) {
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const userInBand = await prisma.usersInBands.findUnique({
    where: {
      userId_bandId: {
        userId,
        bandId,
      },
    },
  });
  if (userInBand) {
    return { error: "User already in band" };
  }
  return await prisma.user.update({
    where: { id: userId },
    data: {
      bands: {
        create: [
          {
            role: "SUB",
            band: {
              connect: { id: bandId },
            },
            bandName: band.name,
          },
        ],
      },
    },
  });
}

export async function deleteBand(bandId: Band["id"]) {
  await prisma.band.delete({
    where: { id: bandId },
  });
}

export async function generateBandToken(bandId: Band["id"], token: string) {
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  // hash the code and store it in the database
  const hash = await bcrypt.hash(token, 10);
  // upsert the hash
  return prisma.bandToken.upsert({
    where: { bandId },
    create: {
      bandId,
      hash,
    },
    update: {
      hash,
    },
  });
}

async function getBandToken(bandId: Band["id"]) {
  return prisma.bandToken.findUnique({
    where: { bandId },
  });
}

export async function generateJoinBandLink(
  bandId: Band["id"],
  domainUrl: string,
) {
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const { code } = band;

  // get band token
  const currentToken = await getBandToken(bandId);

  //  if no token, generate one
  if (!currentToken) {
    await generateBandToken(bandId, code);
  }
  const url = new URL(domainUrl);
  url.pathname = "/home/add-to-band";
  url.searchParams.set("token", encrypt(code));
  url.searchParams.set("bandId", bandId);

  return url.toString();
}

export async function compareBandToken(token: string, bandId: Band["id"]) {
  const bandToken = await getBandToken(bandId);
  if (!bandToken) {
    throw new Error("Band token not found");
  }
  return bcrypt.compare(token, bandToken.hash);
}
