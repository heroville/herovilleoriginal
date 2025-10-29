import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import ngAnnotate from 'rollup-plugin-ng-annotate';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [{ src: 'src/lib/**/*', dest: 'src/lib' }]
    })
  ],
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
