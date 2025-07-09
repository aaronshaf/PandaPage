import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/browser-document-viewer/' : '/',
  resolve: {
    alias: {
      '@browser-document-viewer/core': resolve(__dirname, '../core/index.ts'),
      '@browser-document-viewer/parser': resolve(__dirname, '../parser/src/index.ts'),
      '@browser-document-viewer/renderer-dom': resolve(__dirname, '../renderer-dom/src/index.ts'),
      '@browser-document-viewer/renderer-markdown': resolve(__dirname, '../renderer-markdown/src/index.ts'),
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
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    // Exclude workspace packages to ensure they're always fresh
    exclude: [
      '@browser-document-viewer/core',
      '@browser-document-viewer/parser', 
      '@browser-document-viewer/renderer-dom',
      '@browser-document-viewer/renderer-markdown'
    ],
  },
});