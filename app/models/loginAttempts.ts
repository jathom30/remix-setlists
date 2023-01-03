import type { User } from "@prisma/client";
import { prisma } from "~/db.server";
import { updateUser } from "./user.server";

export async function createLoginAttempt(userId: User['id']) {
  return prisma.loginAttempts.create({ data: { userId, attempts: 1 } })
}

export async function getLoginAttempt(userId: User['id']) {
  return prisma.loginAttempts.findUnique({ where: { userId } })
}

export async function incrementLoginAttempt(userId: User['id']) {
  const loginAttempt = await getLoginAttempt(userId)
  if (!loginAttempt) {
    return await createLoginAttempt(userId)
  }
  const newAttemptCount = loginAttempt.attempts + 1

  // if login attempts exceed 10 fails in 10 minuntes,
  // lock account and tell user/redirect to click forgot password
  const now = (new Date()).getTime()
  const tenMinutes = 1000 * 60 * 10
  const lockTime = loginAttempt.createdAt.getTime() + tenMinutes
  // if locktime has expired, delete and create a new to track
  if (now > lockTime) {
    await deleteLoginAttempt(userId)
    return await createLoginAttempt(userId)
  }

  const maxAttemptCount = 10
  const isLocked = newAttemptCount >= maxAttemptCount && now <= lockTime
  if (isLocked) {
    // update user?
    await updateUser(userId, { locked: true })
    throw new Response('exceeded failed attempts', { status: 401 })
  }

  return prisma.loginAttempts.update({
    where: { userId },
    data: { attempts: newAttemptCount }
  })
}

export async function deleteLoginAttempt(userId: User['id']) {
  const loginAttempt = await getLoginAttempt(userId)
  if (!loginAttempt) return
  return prisma.loginAttempts.delete({ where: { userId } })
}