import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/pandapage/' : '/',
  resolve: {
    alias: {
      '@pandapage/pandapage': resolve(__dirname, '../pandapage/index.ts'),
      '@pandapage/parser': resolve(__dirname, '../parser/src/index.ts'),
      '@pandapage/renderer-dom': resolve(__dirname, '../renderer-dom/src/index.ts'),
      '@pandapage/renderer-markdown': resolve(__dirname, '../renderer-markdown/src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['@pandapage/pandapage', '@pandapage/parser', '@pandapage/renderer-dom', '@pandapage/renderer-markdown'],
  },
});