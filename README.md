# Setup

```shell
docker compose up
bun install
bun run prisma migrate deploy
bun run prisma generate
```

# Test

```shell
cp .env.example .env
bun run test
bun run test:e2e
```

# Run

```shell
bun run dev:api
bun run dev:web
```