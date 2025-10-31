import { defineConfig } from 'vite';
import ngAnnotate from 'rollup-plugin-ng-annotate';

export default defineConfig({
  plugins: [],
  esbuild: {
    minifyIdentifiers: false,
    target: 'esnext' // allow features like top-level await during dev transforms
  },
  base: './',
  build: {
    target: 'esnext', // permit top-level await in bundled output for modern browsers
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    rollupOptions: {
      plugins: [
        ngAnnotate()
      ]
    }
  }
});
