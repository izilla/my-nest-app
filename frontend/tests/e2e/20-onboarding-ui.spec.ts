/** biome-ignore-all lint/security/noSecrets: false positives */
import { expect, test } from '@playwright/test';
import { uniqueEmail, uniqueTenantName } from './test-utils';

test('onboarding UI creates tenant via form', async ({ page, baseURL }) => {
  const tenantName = uniqueTenantName();
  const adminEmail = uniqueEmail();

  const url = `${baseURL?.replace(/\/$/g, '') || 'http://localhost:3000'}/signup`;
  await page.goto(url);

  await page.fill('input[name="organization"]', tenantName);
  await page.fill('input[name="email"]', adminEmail);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');

  const submitButton = page.getByRole('button', { name: /sign up/i });
  await expect(submitButton).toBeEnabled();

  const [response] = await Promise.all([page.waitForResponse('**/tenants', { timeout: 20000 }), submitButton.click()]);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(201);
});
