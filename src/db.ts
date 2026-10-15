import { Elysia } from 'elysia'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  min: Number(process.env.DATABASE_MIN_POOL_SIZE),
  max: Number(process.env.DATABASE_MAX_POOL_SIZE),
})

// ponytail: `sql` shadows Elysia's reserved `query` context key; plain-call API here vs tagged templates for Bun.SQL/postgres.js.
export const db = new Elysia({ name: 'db' })
  .decorate('sql', (text: string, values?: unknown[]) => pool.query(text, values))
  .onStop(() => pool.end())
