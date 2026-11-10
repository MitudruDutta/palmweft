import { defineConfig } from 'vitest/config';

// Run workspace tests together, treating each app or package directory as its own test project.
export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/*'],
  },
});
