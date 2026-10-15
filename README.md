# elysia-pg-bun-pg

Plain [Elysia](https://elysiajs.com) + Postgres (`pg`) on Bun. Implements the benchmark contract from `http-framework-benchmarks`. Identical to `elysia-pg-bun-sql` except driver.

```bash
bun install
docker compose up -d --wait   # Postgres, seeded from db/init-postgres.sql
bun run dev
```

Config comes from `.env` / environment (`PORT`, `DATABASE_*`). Checks: `bun run check`, `bun test`.
