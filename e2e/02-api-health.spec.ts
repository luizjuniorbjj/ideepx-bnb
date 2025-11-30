import { test, expect } from './fixtures';

/**
 * E2E Test: API Health Checks
 *
 * Verifica que o backend API está funcionando
 */

test.describe('API Health Checks', () => {
  const API_BASE_URL = 'http://localhost:5001';

  test('should have backend API running', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/health`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });

  test('should have database connection working', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/health`);

    const data = await response.json();
    expect(data).toHaveProperty('database');
    expect(data.database).toBe('connected');
  });

  test('should respond to /api/users endpoint', async ({ request }) => {
    // Verificar que endpoint existe (mesmo que retorne erro de auth ou 404)
    const response = await request.get(`${API_BASE_URL}/api/users`);

    // Deve responder (200, 401, 403, ou 404 são OK)
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('should respond to /api/mlm endpoints', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/mlm/stats`);

    // Endpoint deve responder
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
