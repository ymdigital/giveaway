import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "server-only": path.resolve(import.meta.dirname, "src/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: { include: ["src/lib/**/*.ts"], exclude: ["src/lib/supabase-server.ts", "src/lib/repo.ts", "src/lib/client-api.ts"] },
  },
});
