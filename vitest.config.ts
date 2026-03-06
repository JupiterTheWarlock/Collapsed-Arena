import { defineConfig } from 'vitest/config';

export default defineConfig({
  assetsInclude: ['**/*.json'],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/test-utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.ts'
      ]
    }
  }
});
