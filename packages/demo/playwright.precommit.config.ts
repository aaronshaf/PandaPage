import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for precommit hook - fast headless Chromium only
 */
export default defineConfig({
  testDir: './test',
  /* Maximum time one test can run for */
  timeout: 5000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: true,
  /* No retries for precommit to keep it fast */
  retries: 0,
  /* Use single worker for precommit */
  workers: 1,
  /* Reporter to use - minimal for precommit */
  reporter: 'line',
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* No tracing for precommit to keep it fast */
    trace: 'off',
    /* No screenshot for precommit to keep it fast */
    screenshot: 'off',
    /* Run headless */
    headless: true,
  },

  /* Configure projects - only Chromium for precommit */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'bun run preview', // Use preview instead of dev for built files
    url: 'http://localhost:3000',
    reuseExistingServer: false, // Always start fresh for precommit
    timeout: 30 * 1000, // Shorter timeout for precommit
  },
});