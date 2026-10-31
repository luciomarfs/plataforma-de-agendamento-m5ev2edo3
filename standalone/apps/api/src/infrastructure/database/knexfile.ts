import type { Knex } from 'knex'

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection:
      process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agendamento_db',
    migrations: {
      directory: './migrations',
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
    pool: { min: 2, max: 10 },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
      extension: 'js',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
      extension: 'js',
    },
    pool: { min: 2, max: 20 },
  },
}

export default config
