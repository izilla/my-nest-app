import { expect, test } from '@playwright/test';

test('frontend loads and returns 200 on /', async ({ request, baseURL }) => {
  const res = await request.get(baseURL || '/');
  expect(res.status()).toBeGreaterThanOrEqual(200);
  expect(res.status()).toBeLessThan(400);
});
