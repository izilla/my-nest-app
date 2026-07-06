import { expect, test } from '@playwright/test';

test('tenant creation API returns 201', async ({ request, baseURL }) => {
  const unique = Date.now();
  const payload = {
    name: `e2e-tenant-${unique}`,
    // backend expects `tenantAdmins` array and optional `users` array
    tenantAdmins: [
      {
        email: `e2e+${unique}@example.com`,
        name: `E2E Admin ${unique}`,
      },
    ],
    users: [],
  };

  // Allow overriding the API base URL for tests that target a separate backend.
  const apiBase = process.env.PLAYWRIGHT_API_BASE_URL || (baseURL ? `${baseURL}/api` : '/api');
  const url = `${apiBase.replace(/\/$/, '')}/tenants`;

  const res = await request.post(url, { data: payload });

  // Helpful debug output on failure to diagnose 404/500 issues in CI/local runs.
  if (res.status() !== 201) {
    const text = await res.text().catch(() => '<no-body>');
    console.error('Tenant creation failed', { url, status: res.status(), body: text });
  }

  expect(res.status()).toBe(201);
  const body = await res.json().catch(() => ({}));
  expect(body).toBeTruthy();
  expect(body.tenant ?? body.name).toBeTruthy();
});
