import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.NODE_ENV === "production" ? "/browser-document-viewer/" : "/",
  resolve: {
    alias: {
      "@browser-document-viewer/core": resolve(__dirname, "../core/index.ts"),
      "@browser-document-viewer/parser": resolve(__dirname, "../parser/src/index.ts"),
      "@browser-document-viewer/dom-renderer": resolve(__dirname, "../dom-renderer/src/index.ts"),
      "@browser-document-viewer/markdown-renderer": resolve(
        __dirname,
        "../markdown-renderer/src/index.ts",
      ),
    },
  },
  server: {
    port: 3000,
    watch: {
      // Force polling for better cross-platform compatibility
      usePolling: true,
      interval: 100,
    },
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
  build: {
    outDir: "dist",
  },
  optimizeDeps: {
    // Exclude workspace packages to ensure they're always fresh
    exclude: [
      "@browser-document-viewer/core",
      "@browser-document-viewer/parser",
      "@browser-document-viewer/dom-renderer",
      "@browser-document-viewer/markdown-renderer",
    ],
  },
});
