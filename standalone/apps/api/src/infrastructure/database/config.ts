import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const connectionString = process.env.DATABASE_URL

if (!connectionString?.trim()) {
  throw new Error('DATABASE_URL deve ser definida no ambiente ou no arquivo apps/api/.env.')
}

export const databaseUrl = connectionString
