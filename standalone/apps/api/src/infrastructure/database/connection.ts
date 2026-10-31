import knex, { Knex } from 'knex'
import { databaseUrl } from './config.js'

export const db: Knex = knex({
  client: 'pg',
  connection: databaseUrl,
  pool: {
    min: 2,
    max: 10,
  },
  // Converte automaticamente datas e timestamps de forma consistente
})

export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1')
    return true
  } catch (err) {
    console.warn('[Database] Aviso: Não foi possível conectar ao Postgres:', (err as Error).message)
    return false
  }
}
