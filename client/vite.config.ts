import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@strawhats/shared": path.resolve(__dirname, "../shared/types.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        credentials: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/vitest.setup.ts"],
    globals: true,
  },
});
