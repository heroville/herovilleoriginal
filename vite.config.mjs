import { defineConfig } from 'vite';
import ngAnnotate from 'rollup-plugin-ng-annotate';

export default defineConfig({
  plugins: [],
  esbuild: {
    minifyIdentifiers: false
  },
  base: './',
  build: {
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
