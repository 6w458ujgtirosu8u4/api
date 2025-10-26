import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
  test: {
    poolOptions: {
      setupFiles: ["./test/migrations.ts"],
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          compatibilityFlags: [
            "enable_nodejs_tty_module",
            "enable_nodejs_fs_module",
            "enable_nodejs_http_modules",
            "enable_nodejs_perf_hooks_module",
          ],
          bindings: {
            MIGRATIONS: await readD1Migrations("./migrations"),
          },
          kvNamespaces: ["KV"],
          d1Databases: ["D1"],
        },
      },
    },
  },
});
