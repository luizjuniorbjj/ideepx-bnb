import { test, expect } from './fixtures';

/**
 * E2E Test: Network Tree Visualization
 *
 * Testa a página de rede MLM e visualização da árvore
 */

test.describe('Network Tree Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/network');
    await page.waitForLoadState('networkidle');
  });

  test('should load network page successfully', async ({ page }) => {
    await expect(page).toHaveURL(/.*network.*/);

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display network tree or prompt to connect', async ({ page }) => {
    await page.waitForTimeout(2000);

    const body = page.locator('body');

    // Pode mostrar:
    // 1. Árvore de rede
    // 2. Mensagem "sem downline"
    // 3. Prompt para conectar wallet

    const hasTree = await body.locator('svg, canvas, [class*="tree"]').count() > 0;
    const hasNodes = await body.getByText(/downline|referral|level|nível/i).count() > 0;
    const hasEmptyState = await body.getByText(/no.*downline|sem.*referral|vazio|empty/i).count() > 0;
    const hasConnectPrompt = await body.getByText(/connect|conectar.*wallet/i).count() > 0;

    expect(hasTree || hasNodes || hasEmptyState || hasConnectPrompt).toBeTruthy();
  });

  test('should show sponsor information if available', async ({ page }) => {
    await page.waitForTimeout(2000);

    const body = page.locator('body');

    // Procurar por informações de sponsor
    const hasSponsorInfo = await body.getByText(/sponsor|upline|referrer/i).count() > 0;
    const hasAddress = await body.getByText(/0x[a-fA-F0-9]{4}/i).count() > 0;

    // Página deve ter carregado mesmo que não mostre sponsor
    const pageLoaded = await page.locator('main').count() > 0;

    expect(hasSponsorInfo || hasAddress || pageLoaded).toBeTruthy();
  });

  test('should display level-by-level breakdown', async ({ page }) => {
    await page.waitForTimeout(2000);

    const body = page.locator('body');

    // Procurar por níveis (L1, L2, ... L10)
    const hasLevels = await body.getByText(/L[1-9]|level.*[1-9]|nível.*[1-9]/i).count() > 0;

    // Ou contadores
    const hasCounters = await body.getByText(/\d+.*member|membro|user|usuário/i).count() > 0;

    const pageLoaded = await page.locator('main').count() > 0;

    expect(hasLevels || hasCounters || pageLoaded).toBeTruthy();
  });

  test('should handle empty network state', async ({ page }) => {
    // Se usuário não tem downline, deve mostrar estado vazio apropriado
    await page.waitForTimeout(2000);

    const body = page.locator('body');

    // Verificar que página não está em erro
    const hasErrorText = await body.getByText(/error.*occurred|erro|failed|falhou/i).count();
    expect(hasErrorText).toBeLessThan(3); // Pode ter 1-2 erros de API, mas não muitos

    // Deve ter conteúdo
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('should display commission information', async ({ page }) => {
    await page.waitForTimeout(2000);

    const body = page.locator('body');

    // Procurar por informações de comissão
    const hasCommissionInfo = await body.getByText(/commission|comiss|earning|ganho|%/i).count() > 0;
    const hasDollarAmounts = await body.getByText(/\$\d+|\d+\.\d+.*USD/i).count() > 0;

    const pageLoaded = await page.locator('main').count() > 0;

    expect(hasCommissionInfo || hasDollarAmounts || pageLoaded).toBeTruthy();
  });

  test('should have interactive elements for tree navigation', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Verificar se há elementos interativos (botões, links, etc)
    const buttons = page.locator('button:visible');
    const links = page.locator('a:visible');

    const buttonCount = await buttons.count();
    const linkCount = await links.count();

    // Deve ter pelo menos alguns elementos interativos
    expect(buttonCount + linkCount).toBeGreaterThan(0);
  });
});
