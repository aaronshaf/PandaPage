import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html'
  },
  // Configure for GitHub Pages deployment
  output: {
    assetPrefix: process.env.NODE_ENV === 'production' ? '/browser-document-viewer/' : '/'
  },
  source: {
    // Include workspace packages in compilation
    include: [
      /node_modules[\\/]@browser-document-viewer[\\/]/,
    ],
  },
  resolve: {
    alias: {
      '@browser-document-viewer/core': resolve(__dirname, '../core/index.ts'),
      '@browser-document-viewer/parser': resolve(__dirname, '../parser/src/index.ts'),
      '@browser-document-viewer/renderer-dom': resolve(__dirname, '../renderer-dom/src/index.ts'),
      '@browser-document-viewer/renderer-markdown': resolve(__dirname, '../renderer-markdown/src/index.ts'),
    },
  },
  tools: {
    postcss: {
      plugins: [
        '@tailwindcss/postcss',
        'autoprefixer',
      ],
    },
  },
});
