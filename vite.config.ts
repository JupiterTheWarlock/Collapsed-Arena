import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022'
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false
  },
  assetsInclude: ['**/*.json'],
  optimizeDeps: {
    include: ['three']
  }
});
