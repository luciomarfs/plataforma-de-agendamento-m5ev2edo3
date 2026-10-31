import type { Knex } from 'knex'
import path from 'path'
import { databaseUrl } from './config.js'

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: databaseUrl,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts',
    },
    pool: { min: 2, max: 10 },
  },
  production: {
    client: 'pg',
    connection: databaseUrl,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'js',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'js',
    },
    pool: { min: 2, max: 20 },
  },
}

export default config
