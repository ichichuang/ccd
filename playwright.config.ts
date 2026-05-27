import { defineConfig, devices } from '@playwright/test'

const PORT = 8088
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 960 },
    colorScheme: 'light',
    locale: 'zh-CN',
    headless: true,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 960 },
      },
    },
  ],
  webServer: {
    command: `pnpm ci:prepare-internal && VITE_PORT=${PORT} VITE_ROUTER_MODE=hash VITE_PUBLIC_PATH=/ VITE_ROOT_REDIRECT=/dashboard VITE_APP_ENV=development VITE_API_BASE_URL=http://localhost:3003 VITE_API_TIMEOUT=10000 VITE_PROXY_TIMEOUT=15000 VITE_PINIA_PERSIST_KEY_PREFIX=app-template-storage-e2e VITE_PUBLIC_STORAGE_OBFUSCATION_KEY=__E2E_OBFUSCATION_KEY__ VITE_DEMO_MOCK_ENABLED=true pnpm --filter @ccd/web-demo exec vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
