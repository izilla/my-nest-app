Playwright E2E tests

Quick start

1. Ensure frontend is running (default: http://localhost:3000)
2. Ensure backend is running and reachable by the frontend
3. From the `frontend` folder install dependencies and run tests:

```bash
cd frontend
bun install
bunx playwright install --with-deps
bun run e2e
```

Notes

- Tests use `PLAYWRIGHT_BASE_URL` if set, otherwise `http://localhost:3000`.
- The `10-tenant-api.spec.ts` test calls the real `POST /api/tenants` endpoint — ensure tests run against an isolated test environment.
