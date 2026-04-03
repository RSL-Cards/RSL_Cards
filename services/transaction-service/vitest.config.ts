import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      enabled: process.env.CI === "true",
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/utils/profit.ts"],
    },
  },
});
