import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2019",
    cssTarget: ["chrome111", "edge111", "firefox113", "safari16.4"],
    rollupOptions: {
      output: {
        // Keyed on the directory a module was resolved out of, not on the
        // package name. A name is matched against the package's own entry
        // module, and nothing imports `react-dom` itself -- `react-dom/client`
        // is a different module, so the renderer fell through into the entry
        // chunk and every release sent a returning visitor to download React a
        // second time.
        manualChunks(id) {
          if (
            /\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(
              id,
            )
          ) {
            return "react";
          }
          if (/\/node_modules\/@supabase\//.test(id)) return "supabase";
          return undefined;
        },
      },
    },
  },
});
