import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { InlineConfig } from "vitest/node";

interface VitestConfigExport extends UserConfig {
  test: InlineConfig;
}

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
  },
  plugins: [reactRouter(), tsconfigPaths()],
} as VitestConfigExport);
