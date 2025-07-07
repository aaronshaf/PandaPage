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
    assetPrefix: process.env.NODE_ENV === 'production' ? '/pandapage/' : '/'
  },
  source: {
    // Include workspace packages in compilation
    include: [
      /node_modules[\\/]@pandapage[\\/]/,
    ],
  },
  resolve: {
    alias: {
      '@pandapage/pandapage': resolve(__dirname, '../pandapage/index.ts'),
      '@pandapage/parser': resolve(__dirname, '../parser/src/index.ts'),
      '@pandapage/renderer-dom': resolve(__dirname, '../renderer-dom/src/index.ts'),
      '@pandapage/renderer-markdown': resolve(__dirname, '../renderer-markdown/src/index.ts'),
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
