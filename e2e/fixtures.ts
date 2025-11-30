import { test as base } from '@playwright/test';

/**
 * Custom test fixtures that extend Playwright's base test
 * Automatically sets E2E_TESTING flag in localStorage before each test
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Set localStorage flag before navigating to any page
    await page.addInitScript(() => {
      localStorage.setItem('E2E_TESTING', 'true');
    });
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
