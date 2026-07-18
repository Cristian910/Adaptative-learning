import { defineConfig, devices } from '@playwright/test';

// ─── Playwright config ────────────────────────────────────────────────────────
// Nota para quien corra esto: este sandbox de desarrollo no tiene salida de
// red hacia el CDN de binarios de Playwright, así que estos tests se
// escribieron y revisaron con cuidado pero NO se pudieron ejecutar acá. Para
// correrlos: `npx playwright install --with-deps` (una sola vez) y después
// `npx playwright test`.

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
