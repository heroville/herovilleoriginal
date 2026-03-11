import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    minifyIdentifiers: false,
    jsx: 'automatic'
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild'
  }
});
