import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Unit/component tests only. Playwright owns tests-e2e/.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests-e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Core logic must hit 80%+. UI is covered by e2e, so it's excluded here.
      include: ["src/parser/**", "src/features/**/domain/**", "src/features/**/lib/**"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
