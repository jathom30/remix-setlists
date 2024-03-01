import { User } from "@prisma/client";
import * as configCat from "configcat-js-ssr";
import invariant from "tiny-invariant";

export const featureFlagKeys = ["rebranding", "updateMarketingRoute"] as const;
export type FeatureFlagKey = (typeof featureFlagKeys)[number];

export async function getFeatureFlags(user: User | null) {
  const isProd = process.env.NODE_ENV === "production";

  const configCatKey = isProd
    ? process.env.CONFIG_CAT_PRODUCTION_API_KEY
    : process.env.CONFIG_CAT_DEV_API_KEY;

  invariant(configCatKey, "Config Cat API key must be set");
  const configCatClient = configCat.getClient(
    configCatKey,
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
