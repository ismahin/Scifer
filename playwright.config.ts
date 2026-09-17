import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    channel: 'chrome',
    viewport: { width: 1440, height: 960 },
    launchOptions: { args: ['--enable-webgl', '--ignore-gpu-blocklist'] },
    screenshot: 'only-on-failure',
  },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://localhost:5173', reuseExistingServer: !process.env.CI },
})
