import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html'
  },
  // Configure for GitHub Pages deployment
  output: {
    assetPrefix: process.env.NODE_ENV === 'production' ? '/PandaPage/' : '/'
  }
});
