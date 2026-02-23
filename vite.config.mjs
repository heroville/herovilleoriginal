import { defineConfig } from 'vite';
import ngAnnotate from 'rollup-plugin-ng-annotate';

export default defineConfig({
  resolve: {
    // Single jQuery instance for app, jQuery UI, and Bootstrap
    dedupe: ['jquery']
  },
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
