import { createCookieSessionStorage, redirect } from "react-router";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

import { getMemberRole } from "./models/usersInBands.server";
import { RoleEnum } from "./utils/enums";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  // redirect includes search params
  redirectTo = `${new URL(request.url).pathname}?${
    new URL(request.url).searchParams
  }`,
) {
  const userId = await getUserId(request);
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
  if (!userId) {
    throw redirect(`/login?${searchParams}`);
  }
  const user = await getUserById(userId);
  if (!user?.verified) {
    throw redirect(`/join/requestVerification?${searchParams}`);
  }
  return userId;
}

export async function requireMemberOfRole(
  request: Request,
  bandId: string,
  role: RoleEnum,
) {
  const userId = await requireUserId(request);
  const memberRole = (await getMemberRole(
    bandId,
    userId,
  )) as unknown as RoleEnum;

  if (memberRole !== role) {
    throw new Response("Permission denied", { status: 403 });
  }
  return userId;
}

export async function requireAdminMember(request: Request, bandId: string) {
  return requireMemberOfRole(request, bandId, RoleEnum.ADMIN);
}

export async function requireNonSubMember(request: Request, bandId: string) {
  const userId = await requireUserId(request);
  const memberRole = (await getMemberRole(
    bandId,
    userId,
  )) as unknown as RoleEnum;

  if (memberRole === RoleEnum.SUB) {
    throw new Response("Permission denied", { status: 403 });
  }
  return memberRole;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 * 4 // 28 days
          : 60 * 60 * 24 * 7, // 7 days
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
