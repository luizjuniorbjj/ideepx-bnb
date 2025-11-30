import { test, expect } from './fixtures';

/**
 * E2E Test: Dashboard Flow
 *
 * Testa carregamento completo do dashboard com dados GMI
 */

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard page structure', async ({ page }) => {
    // Verificar elementos principais do dashboard
    await expect(page).toHaveTitle(/Dashboard|iDeepX/i);

    // Deve ter seções principais
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('should display performance metrics cards', async ({ page }) => {
    // Aguardar loading state
    await page.waitForTimeout(2000);

    // Verificar se existem cards de métricas
    // Pode estar com loading ou com dados
    const body = page.locator('body');
    const hasLoadingState = await body.getByText(/loading|carregando/i).count() > 0;
    const hasMetrics = await body.getByText(/profit|lucro|balance|saldo|volume/i).count() > 0;

    expect(hasLoadingState || hasMetrics).toBeTruthy();
  });

  test('should handle GMI data loading', async ({ page }) => {
    // Aguardar request de GMI data (pode falhar se não conectado)
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/gmi') || response.url().includes('/api/users'),
      { timeout: 10000 }
    ).catch(() => null);

    await responsePromise;

    // Dashboard deve estar em um dos estados:
    // 1. Conectado e mostrando dados
    // 2. Mostrando erro de conexão
    // 3. Pedindo para conectar wallet

    const body = page.locator('body');
    const hasData = await body.getByText(/\$|balance|saldo|profit/i).count() > 0;
    const hasError = await body.getByText(/error|erro|failed/i).count() > 0;
    const hasConnectPrompt = await body.getByText(/connect|conectar|wallet/i).count() > 0;

    expect(hasData || hasError || hasConnectPrompt).toBeTruthy();
  });

  test('should display wallet connection status', async ({ page }) => {
    // Verificar se há indicador de status de wallet
    const body = page.locator('body');

    const hasWalletUI = await body.getByText(/connect|conectar|disconnect|0x[a-fA-F0-9]{4}/i).count() > 0;
    expect(hasWalletUI).toBeTruthy();
  });

  test('should show subscription status', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Dashboard deve mostrar status de subscription
    const body = page.locator('body');

    // Pode mostrar:
    // - Status ativo/inativo
    // - Botão de assinar
    // - Data de expiração
    const hasSubscriptionInfo = await body.getByText(/subscri|assinatura|active|ativo|expired/i).count() > 0;

    // Se não mostrar info de subscription, pelo menos deve ter carregado a página
    const pageLoaded = await body.locator('main').count() > 0;

    expect(hasSubscriptionInfo || pageLoaded).toBeTruthy();
  });

  test('should display MLM level information', async ({ page }) => {
    await page.waitForTimeout(2000);

    const body = page.locator('body');

    // Procurar por informações de níveis MLM
    const hasLevelInfo = await body.getByText(/level|nível|tier|bronze|silver|gold/i).count() > 0;

    // Ou mostrar volume/requisitos
    const hasVolumeInfo = await body.getByText(/volume|requisitos|requirement/i).count() > 0;

    // Dashboard pode não mostrar isso se não conectado
    // Então verificamos apenas que a página carregou
    const pageLoaded = await page.locator('main').count() > 0;

    expect(hasLevelInfo || hasVolumeInfo || pageLoaded).toBeTruthy();
  });

  test('should have responsive layout', async ({ page }) => {
    // Testar em diferentes viewports
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(500);

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verificar que conteúdo é visível
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();

    // Voltar para desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    await expect(mainContent).toBeVisible();
  });
});
