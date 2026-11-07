import { defineConfig } from '@playwright/test'

const preview = process.env.PLAYWRIGHT_PREVIEW === '1'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
  },
  webServer: {
    command: preview ? 'npm run preview -- --host 127.0.0.1 --port 4173' : 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
