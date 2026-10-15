import { Elysia, NotFoundError } from 'elysia'
import { db } from './db.ts'
import { int, ints, param, pgIntArray, records } from './parse.ts'

export const bench = new Elysia({ prefix: '/bench' })
  .use(db)
  .get('/plaintext', () => 'Hello, World!')
  .get('/json', () => ({ message: 'Hello, World!' }))
  .get('/read-one', async ({ sql, request }) => {
    const result = await sql(
      'SELECT id, random_number AS "randomNumber" FROM world WHERE id = $1',
      [int(param(request.url, 'id'), 'id')],
    )
    if (!result.rows[0]) throw new NotFoundError()
    return result.rows[0]
  })
  .get('/read-many', ({ sql, request }) => {
    const limit = param(request.url, 'limit')
    const afterId = param(request.url, 'afterId')
    const n = limit === undefined ? 20 : int(limit, 'limit')
    return sql(
      'SELECT id, random_number AS "randomNumber" FROM world WHERE id > $1 ORDER BY id LIMIT $2',
      [afterId === undefined ? 0 : int(afterId, 'afterId'), Math.min(Math.max(n, 1), 100)],
    ).then((result) => result.rows)
  })
  .get('/create-one', async ({ sql, request }) => {
    const result = await sql(
      'INSERT INTO world (random_number) VALUES ($1) RETURNING id, random_number AS "randomNumber"',
      [int(param(request.url, 'randomNumber'), 'randomNumber')],
    )
    return result.rows[0]
  })
  .get('/create-many', ({ sql, request }) => {
    return sql(
      `INSERT INTO world (random_number)
       SELECT unnest($1::int[])
       RETURNING id, random_number AS "randomNumber"`,
      [pgIntArray(ints(param(request.url, 'randomNumber'), 'randomNumber'))],
    ).then((result) => result.rows)
  })
  .get('/update-one', async ({ sql, request }) => {
    const [r] = records(param(request.url, 'record'))
    const result = await sql(
      'UPDATE world SET random_number = $1 WHERE id = $2 RETURNING id, random_number AS "randomNumber"',
      [r.randomNumber, r.id],
    )
    if (!result.rows[0]) throw new NotFoundError()
    return result.rows[0]
  })
  .get('/update-many', ({ sql, request }) => {
    const rs = records(param(request.url, 'record'))
    return sql(
      `UPDATE world w SET random_number = v.r
       FROM unnest($1::int[], $2::int[]) AS v(id, r)
       WHERE w.id = v.id
       RETURNING w.id, w.random_number AS "randomNumber"`,
      [pgIntArray(rs.map((r) => r.id)), pgIntArray(rs.map((r) => r.randomNumber))],
    ).then((result) => result.rows)
  })
  .get('/delete-one', async ({ sql, request }) => {
    await sql('DELETE FROM world WHERE id = $1', [int(param(request.url, 'id'), 'id')])
  })
  .get('/delete-many', async ({ sql, request }) => {
    await sql('DELETE FROM world WHERE id = ANY($1::int[])', [
      pgIntArray(ints(param(request.url, 'id'), 'id')),
    ])
  })
