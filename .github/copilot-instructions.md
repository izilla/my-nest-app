# e2e Test Guidelines

- Use unique test data per worker instead of truncating or deleting entire tables.
- Generate a per-test `TEST_RUN_ID` or `JEST_WORKER_ID` suffix for emails, names, slugs, titles, and other identifiable fields.
- Clean only test records that include the worker/test-specific identifier.
- Avoid global `deleteMany()` cleanup across whole tables in e2e tests.
- Do not rely on `--runInBand` for e2e runs; tests should be parallel-safe when possible.
- Keep test setup and teardown minimal and isolated to a single suite or worker.
- If a test needs authentication, create a worker-specific auth user and login with that user.
- Keep the production schema and the e2e test schema aligned, but isolate e2e test data with unique IDs.

## Recommended workflow

1. Set `TEST_RUN_ID` for CI or rely on `JEST_WORKER_ID`.
2. Use helper functions to create deterministic values such as `uniqueEmail('user')`.
3. Clean up test data in `afterEach` or `afterAll` by filtering on the unique identifier.
4. Avoid deleting rows that other test workers may still be using.
5. Prefer explicit cleanup by type (`user`, `post`, `tenant`, etc.) instead of `deleteMany()` with no filter.

## NestJS-specific e2e guidance

- Treat this as a NestJS app: use `Test.createTestingModule()` and import `AppModule` or the minimal feature module(s) needed for each suite.
- Use `app.getHttpServer()` plus `supertest` to exercise the full HTTP layer.
- Use the NestJS DI container in tests to resolve `PrismaService`, `SecurityService`, and other providers.
- Keep test app initialization in `beforeAll()` and cleanup in `afterEach()`/`afterAll()`.
- Avoid database cleanup inside controller or service code; keep it in test helpers only.
- Use a shared helper module like `test/e2e-utils.ts` for unique test values and cleanup logic.
- Keep `test/jest-e2e.json` and `.env.test` dedicated to e2e execution, not unit tests.
- For CI, set `TEST_RUN_ID` uniquely per pipeline/job and let Jest use workers rather than forcing `--runInBand`.
