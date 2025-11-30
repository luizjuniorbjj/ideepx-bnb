import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para E2E Tests
 *
 * Testa o sistema completo:
 * - Frontend (Next.js - http://localhost:3001)
 * - Backend API (Express - http://localhost:3000)
 * - Database (Prisma + SQLite/PostgreSQL)
 * - Smart Contract (Hardhat local network)
 */

export default defineConfig({
  testDir: './e2e',

  /* Timeout para cada teste */
  timeout: 30 * 1000,

  /* Expect timeout */
  expect: {
    timeout: 5000,
  },

  /* Run tests in files in parallel */
  fullyParallel: false, // Sequencial para evitar conflitos de DB

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: 1, // 1 worker para evitar race conditions

  /* Reporter to use */
  reporter: [
    ['html'],
    ['list']
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3001',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Set environment variables for E2E testing */
    contextOptions: {
      permissions: [], // No special permissions needed
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Adicionar Firefox e Safari quando necessário
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // ⚠️ DESABILITADO: Servidores já estão rodando em background
  // Frontend: http://localhost:3001
  // Backend: http://localhost:5001
  // Para iniciar manualmente:
  //   cd frontend && npm run dev
  //   cd backend && npm run dev
  // webServer: [
  //   {
  //     command: 'cd frontend && npm run dev',
  //     url: 'http://localhost:3001',
  //     timeout: 120 * 1000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'cd backend && npm run dev',
  //     url: 'http://localhost:5001/api/health',
  //     timeout: 120 * 1000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
});
