import { test, expect } from './fixtures';

/**
 * E2E Test: Basic Navigation
 *
 * Testa navegação básica e carregamento de páginas principais
 */

test.describe('Basic Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Aumentar timeout para este teste específico (60s)
    test.setTimeout(60000);

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Verificar que a página carregou
    await expect(page).toHaveTitle(/iDeepX/i);

    // Verificar que o logo está presente
    const logo = page.locator('img[alt*="iDeepX"]').first();
    await expect(logo).toBeVisible();
  });

  test('should navigate to dashboard page', async ({ page }) => {
    await page.goto('/dashboard');

    // Aguardar carregamento
    await page.waitForLoadState('networkidle');

    // Verificar URL
    expect(page.url()).toContain('/dashboard');

    // Verificar que existe conteúdo
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should navigate to network page', async ({ page }) => {
    await page.goto('/network');

    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/network');
  });

  test('should navigate to transparency page', async ({ page }) => {
    await page.goto('/transparency');

    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/transparency');
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Verificar que links de navegação existem
    const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first();
    const networkLink = page.getByRole('link', { name: /network|rede/i }).first();

    await expect(dashboardLink).toBeVisible();
    await expect(networkLink).toBeVisible();
  });

  test('should display connect wallet button', async ({ page }) => {
    await page.goto('/');

    // Botão de conectar carteira deve estar visível
    const connectButton = page.getByRole('button', { name: /connect|conectar/i }).first();
    await expect(connectButton).toBeVisible();
  });
});
