import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config'; // Import your main Vite config

export default mergeConfig(
  viteConfig, // Merge the main Vite config (important for aliases, plugins etc.)
  defineConfig({
    test: {
      // Set the test environment to simulate a DOM
      environment: 'happy-dom',
      // Enable global APIs (describe, it, expect, etc.)
      globals: true,
      // Optional: Setup files to run before each test file (e.g., global mocks)
      // setupFiles: ['./src/tests/setup.ts'],

      // Configure coverage reporting
      coverage: {
        // Use the v8 provider (requires @vitest/coverage-v8)
        provider: 'v8',
        // Specify reporters (text summary, json, html report)
        reporter: ['text', 'json', 'html'],
        // Directory where coverage reports will be generated
        reportsDirectory: './coverage',
        // Files to include in coverage analysis
        include: ['src/**/*.{ts,vue}'],
        // Files/patterns to exclude from coverage analysis
        exclude: [
          'src/main.ts', // Entry point
          'src/router/index.ts', // Router setup
          'src/App.vue', // Root component
          'src/**/*.spec.ts', // Test files themselves
          'src/**/*.test.ts',
          'src/types/**/*', // Type definitions
          'src/plugins/**/*', // Plugins
          // Add other specific files/folders if needed
          // 'src/components/common/**/*',
        ],
      },
    },
  })
);