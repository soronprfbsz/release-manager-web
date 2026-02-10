import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// ES Module에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') })

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Global timeout for test - 10초 초과시 실패 */
  timeout: 10000,

  /* Global timeout for expect assertions */
  expect: {
    timeout: 5000,
  },

  /* Run tests in files in parallel - disabled for auth stability */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests - 빠른 실패를 위해 retry 최소화 */
  retries: process.env.CI ? 1 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : 4,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',

    /* Navigation timeout */
    navigationTimeout: 10000,

    /* Action timeout */
    actionTimeout: 5000,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    /* Setup project - authentication */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
