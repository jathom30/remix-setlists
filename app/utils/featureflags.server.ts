import { User } from "@prisma/client";
import * as configCat from "configcat-js-ssr";
import invariant from "tiny-invariant";

export const featureFlagKeys = [
  "rebranding",
  "isMyFirstFeatureEnabled",
] as const;
export type FeatureFlagKey = (typeof featureFlagKeys)[number];

export async function getFeatureFlags(user: User | null) {
  invariant(process.env.CONFIG_CAT_API_KEY, "CONFIG_CAT_API_KEY must be set");
  const configCatClient = configCat.getClient(
    process.env.CONFIG_CAT_API_KEY,
    configCat.PollingMode.AutoPoll,
  );
  const allFlags = await configCatClient.getAllValuesAsync({
    identifier: user?.id || "",
    custom: {},
    email: user?.email,
  });
  const flagKeyValues = allFlags.reduce(
    (acc, flag) => {
      acc[flag.settingKey as FeatureFlagKey] = flag.settingValue as boolean;
      return acc;
    },
    {} as Record<FeatureFlagKey, boolean>,
  );
  return flagKeyValues;
}
