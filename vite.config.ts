import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    modulePreload: false,
    outDir: "dist",
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (normalized.includes('node_modules/react') || normalized.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (normalized.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (normalized.includes('lineage-idle/src/data/classes') || normalized.includes('lineage-idle/data/echo-adapter')) {
            return 'game-data-classes';
          }
          if (normalized.includes('lineage-idle/src/data/items')) {
            return 'game-data-items';
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
