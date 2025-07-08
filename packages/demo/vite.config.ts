import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/browser-document-viewer/' : '/',
  resolve: {
    alias: {
      '@browser-document-viewer/pandapage': resolve(__dirname, '../pandapage/index.ts'),
      '@browser-document-viewer/parser': resolve(__dirname, '../parser/src/index.ts'),
      '@browser-document-viewer/renderer-dom': resolve(__dirname, '../renderer-dom/src/index.ts'),
      '@browser-document-viewer/renderer-markdown': resolve(__dirname, '../renderer-markdown/src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['@browser-document-viewer/pandapage', '@browser-document-viewer/parser', '@browser-document-viewer/renderer-dom', '@browser-document-viewer/renderer-markdown'],
  },
});