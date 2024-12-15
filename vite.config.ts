import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { InlineConfig } from "vitest/node";

interface VitestConfigExport extends UserConfig {
  test: InlineConfig;
}

declare module "@remix-run/server-runtime" {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
  },
  plugins: [
    remix({
      basename: "/",
      buildDirectory: "build",
      ignoredRouteFiles: ["**/*.css"],
      serverBuildFile: "index.js",
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
} as VitestConfigExport);
