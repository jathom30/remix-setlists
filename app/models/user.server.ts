import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

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
