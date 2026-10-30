import knex, { Knex } from 'knex';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agendamento_db';

export const db: Knex = knex({
  client: 'pg',
  connection: connectionString,
  pool: {
    min: 2,
    max: 10,
  },
  // Converte automaticamente datas e timestamps de forma consistente
});

export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (err) {
    console.warn('[Database] Aviso: Não foi possível conectar ao Postgres:', (err as Error).message);
    return false;
  }
}
