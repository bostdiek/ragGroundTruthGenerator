/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],
    css: true,
    exclude: [
      'node_modules/**',
      'e2e-tests/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/testing/',
        '**/*.d.ts',
      ],
    },
    // Add timeout and other fixes for tests that might get stuck
    testTimeout: 10000, // Increase timeout to 10 seconds
    hookTimeout: 10000,
    maxThreads: 1, // Run tests in sequence to avoid issues with concurrent requests
    minThreads: 1,
    isolate: true, // Isolate environments for tests
  },
});
