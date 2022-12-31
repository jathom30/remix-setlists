import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import { createToken, deleteToken, getToken } from "./token.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUsersById(ids: User['id'][]) {
  return prisma.user.findMany({
    where: {
      id: {
        in: ids
      }
    }
  })
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string, name: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      name
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function getUserWithBands(request: Request) {
  const userId = await requireUserId(request)
  const bands = await prisma.user.findUnique({
    where: { id: userId },
    include: { bands: true }
  })
  return bands
}

export async function updateUser(id: User['id'], name: User['name'], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.update({
    where: { id },
    data: {
      name,
      password: {
        update: {
          hash: hashedPassword
        }
      }
    }
  })
}

export async function updateUserPassword(userId: User['id'], password: string) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.password.update({
    where: { userId },
    data: {
      hash
    }
  })
}

export async function generateTokenLink(email: User['email'], pathname: string) {
  const user = await getUserByEmail(email)
  if (!user) { throw new Error("User does not exist") }
  // if token exists for user, delete it
  const preExistingToken = await getToken(user.id)
  if (preExistingToken) {
    await deleteToken(user.id)
  }

  // create new token for email
  const token = crypto.randomBytes(32).toString('hex')
  // save hashed token to db
  await createToken(user.id, token)

  // ! look through kentcdodds website to see how to dynamically set url
  const clientURL = 'localhost:3001'

  const link = `${clientURL}/${pathname}?token=${token}&id=${user.id}`
  return link
}

export async function compareToken(resetToken: string, userId: User['id']) {
  const token = await getToken(userId)
  if (!token) throw new Error('not found')
  // handle expired token
  const now = (new Date()).getTime()
  const tenMinutes = 1000 * 60 * 10
  const expiryTime = token.createdAt.getTime() + tenMinutes

  const isExpired = now > expiryTime
  if (isExpired) {
    await deleteToken(userId)
    throw new Error('expired')
  }

  return bcrypt.compare(resetToken, token.hash)
}

export async function verifyUser(userId: User['id']) {
  const user = await getUserById(userId)
  if (!user) throw new Error('not found')

  return await prisma.user.update({
    where: { id: userId },
    data: {
      verified: true,
    }
  })
}