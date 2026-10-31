import 'dotenv/config'
import { createApp } from './server.js'
import { testConnection } from './infrastructure/database/connection.js'

const PORT = Number(process.env.PORT) || 3333

async function main() {
  console.log('🚀 Iniciando Plataforma de Agendamento API...')

  const dbConnected = await testConnection()
  if (dbConnected) {
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso.')
  } else {
    console.warn(
      '⚠️ Não foi possível verificar o banco de dados no startup. Verifique DATABASE_URL antes de rodar queries.',
    )
  }

  const app = createApp()

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 API ouvindo em http://0.0.0.0:${PORT}`)
    console.log(`📡 Endpoints disponíveis em http://localhost:${PORT}/api/`)
    console.log(`🩺 Health check: http://localhost:${PORT}/health`)
  })
}

main().catch((err) => {
  console.error('❌ Falha fatal ao iniciar o servidor:', err)
  process.exit(1)
})
