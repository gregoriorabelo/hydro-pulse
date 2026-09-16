import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    env: {
      DATABASE_URL: "postgresql://user:pass@ep-test.neon.tech/db",
    },
  },
});
