import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { db } from './infrastructure/database/connection.js'

// Repositórios (Adapters)
import { KnexUsuarioRepository } from './infrastructure/database/repositories/usuario.repository.js'
import { KnexAcessoRepository } from './infrastructure/database/repositories/acesso.repository.js'
import { KnexAcessoEOrganizacaoRepository } from './infrastructure/database/repositories/acessoeorganizacao.repository.js'
import { KnexOrganizacaoRepository } from './infrastructure/database/repositories/organizacao.repository.js'
import { KnexSlotRepository } from './infrastructure/database/repositories/slot.repository.js'
import { KnexAgendamentoRepository } from './infrastructure/database/repositories/agendamento.repository.js'
import { KnexContratoRepository } from './infrastructure/database/repositories/contrato.repository.js'
import { KnexUnitOfWork } from './infrastructure/database/unit-of-work.js'

// Serviços
import { JwtTokenService } from './infrastructure/services/jwt-token.service.js'
import { BcryptHashService } from './infrastructure/services/bcrypt-hash.service.js'
import { ConsoleMailerService } from './infrastructure/services/console-mailer.service.js'

// Casos de Uso
import { AuthUseCases } from './application/use-cases/auth.use-case.js'
import { AgendamentoUseCases } from './application/use-cases/agendamento.use-case.js'
import { EmpresaUseCases } from './application/use-cases/empresa.use-case.js'

// Controllers
import { createAuthRouter } from './infrastructure/http/controllers/auth.controller.js'
import { createOrganizacaoRouter } from './infrastructure/http/controllers/organizacao.controller.js'
import { createProfissionalRouter } from './infrastructure/http/controllers/profissional.controller.js'
import { createSlotRouter } from './infrastructure/http/controllers/slot.controller.js'
import { createAgendamentoRouter } from './infrastructure/http/controllers/agendamento.controller.js'
import { createContratoRouter } from './infrastructure/http/controllers/contrato.controller.js'
import { createDashboardRouter } from './infrastructure/http/controllers/dashboard.controller.js'

// Erros de domínio
import { DomainError } from './domain/errors.js'

export function createApp(): Express {
  const app = express()

  // Middlewares globais
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
  app.use(express.json())

  // 1. Instanciar Repositórios
  const usuarioRepo = new KnexUsuarioRepository(db)
  const acessoRepo = new KnexAcessoRepository(db)
  const vinculoRepo = new KnexAcessoEOrganizacaoRepository(db)
  const orgRepo = new KnexOrganizacaoRepository(db)
  const slotRepo = new KnexSlotRepository(db)
  const agendamentoRepo = new KnexAgendamentoRepository(db)
  const contratoRepo = new KnexContratoRepository(db)
  const uow = new KnexUnitOfWork(db)

  // 2. Instanciar Serviços de Infraestrutura
  const tokenService = new JwtTokenService()
  const hashService = new BcryptHashService()
  const mailerService = new ConsoleMailerService()

  // 3. Instanciar Casos de Uso (Arquitetura Hexagonal: injeção de dependência via portas)
  const authUseCases = new AuthUseCases(
    usuarioRepo,
    acessoRepo,
    hashService,
    tokenService,
    mailerService,
  )

  const agendamentoUseCases = new AgendamentoUseCases(
    slotRepo,
    agendamentoRepo,
    contratoRepo,
    orgRepo,
    usuarioRepo,
    acessoRepo,
    vinculoRepo,
    uow,
  )

  const empresaUseCases = new EmpresaUseCases(
    orgRepo,
    slotRepo,
    contratoRepo,
    usuarioRepo,
    acessoRepo,
    vinculoRepo,
    agendamentoRepo,
  )

  // Healthcheck & Docs
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Plataforma de Agendamento API',
      status: 'online',
      version: '1.0.0',
      database: 'PostgreSQL + Knex',
      architecture: 'Hexagonal (Ports and Adapters)',
      endpoints: {
        auth: '/api/auth',
        organizacoes: '/api/organizacoes',
        profissionais: '/api/profissionais',
        usuarios: '/api/profissionais/usuarios',
        slots: '/api/slots',
        agendamentos: '/api/agendamentos',
        contratos: '/api/contratos',
        dashboard: '/api/dashboard',
      },
    })
  })

  app.get('/health', async (_req: Request, res: Response) => {
    try {
      await db.raw('SELECT 1')
      res.json({ status: 'healthy', database: 'connected' })
    } catch (err: any) {
      res.status(503).json({ status: 'unhealthy', database: err.message })
    }
  })

  // 4. Montar Rotas da API
  app.use('/api/auth', createAuthRouter(authUseCases, tokenService, usuarioRepo, acessoRepo))
  app.use('/api/organizacoes', createOrganizacaoRouter(empresaUseCases, tokenService))
  app.use('/api/profissionais', createProfissionalRouter(empresaUseCases, tokenService))
  app.use('/api/slots', createSlotRouter(empresaUseCases, tokenService))
  app.use('/api/agendamentos', createAgendamentoRouter(agendamentoUseCases, tokenService))
  app.use('/api/contratos', createContratoRouter(empresaUseCases, tokenService))
  app.use('/api/dashboard', createDashboardRouter(empresaUseCases, tokenService))

  // Handler de erros global
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof DomainError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('[API Unhandled Error]:', err)
    res.status(500).json({
      error: 'Erro interno no servidor.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
  })

  return app
}
