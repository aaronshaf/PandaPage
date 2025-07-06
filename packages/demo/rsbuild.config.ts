import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

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
  tools: {
    postcss: {
      plugins: [
        '@tailwindcss/postcss',
        'autoprefixer',
      ],
    },
  },
});
