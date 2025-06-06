import type { BandIcon } from "@prisma/client";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { z } from "zod";

import type { User } from "~/models/user.server";

import { RoleEnum } from "./utils/enums";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return Boolean(
    user &&
      typeof user === "object" &&
      "email" in user &&
      typeof user.email === "string",
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

const MemberRoleSchema = z.object({
  memberRole: z.union([
    z.literal("ADMIN"),
    z.literal("MEMBER"),
    z.literal("SUB"),
  ]),
});

export function useMemberRole(): RoleEnum {
  const data = useMatchesData("routes/$bandId");
  const parsedData = MemberRoleSchema.safeParse(data);
  if (!parsedData.success) {
    return RoleEnum.SUB;
  }
  return parsedData.data.memberRole as RoleEnum;
}

export const ADMIN_EMAIL = "jathom30@gmail.com";

export function useUser(): User & { isAdmin: boolean } {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  const isAdmin = maybeUser.email === ADMIN_EMAIL;
  return { ...maybeUser, isAdmin };
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

const isBand = (
  data: unknown,
): data is { band: { icon: BandIcon; name: string } } => {
  const bandData = data && typeof data === "object" && "band" in data;
  return Boolean(bandData);
};

export function useBandIcon() {
  const data = useMatchesData("routes/$bandId");
  if (!data) {
    return;
  }
  if (!isBand(data)) {
    return;
  }
  return { icon: data.band.icon, bandName: data.band.name };
}
