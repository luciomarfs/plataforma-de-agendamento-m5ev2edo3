import { Router, Request, Response, NextFunction } from 'express'
import { AgendamentoUseCases } from '../../../application/use-cases/agendamento.use-case.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { ITokenService } from '../../../application/services/ports.js'

export function createAgendamentoRouter(
  agendamentoUseCases: AgendamentoUseCases,
  tokenService: ITokenService,
): Router {
  const router = Router()
  const auth = authMiddleware(tokenService)

  // POST /agendamentos - Cria agendamento com validação transacional de saldo/capacidade
  router.post('/', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_slot, id_usuario, id_organizacao, observacao } = req.body
      const user = req.user!

      if (!id_slot) {
        res.status(400).json({ error: 'id_slot é obrigatório.' })
        return
      }

      const resultado = await agendamentoUseCases.criarAgendamento({
        id_slot,
        id_usuario: id_usuario || user.id,
        id_organizacao,
        observacao,
        solicitanteId: user.id,
        solicitantePerfis: user.perfis,
      })

      res.status(201).json(resultado)
    } catch (err) {
      next(err)
    }
  })

  // POST /agendamentos/:id/cancelar - Cancela agendamento com estorno de vaga e saldo
  router.post('/:id/cancelar', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      const resultado = await agendamentoUseCases.cancelarAgendamento({
        id_agendamento: req.params.id,
        solicitanteId: user.id,
        solicitantePerfis: user.perfis,
      })
      res.json(resultado)
    } catch (err) {
      next(err)
    }
  })

  // GET /agendamentos/meus - Lista agendamentos do usuário logado
  router.get('/meus', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      const agendamentos = await agendamentoUseCases.listarMeusAgendamentos(user.id)
      res.json(agendamentos)
    } catch (err) {
      next(err)
    }
  })

  // GET /agendamentos/organizacao/:orgId - Lista agendamentos de uma unidade (painel empresa)
  router.get(
    '/organizacao/:orgId',
    auth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const agendamentos = await agendamentoUseCases.listarPorOrganizacao(req.params.orgId)
        res.json(agendamentos)
      } catch (err) {
        next(err)
      }
    },
  )

  // GET /agendamentos/:id - Detalha agendamento
  router.get('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      const agendamento = await agendamentoUseCases.obterAgendamento(
        req.params.id,
        user.id,
        user.perfis,
      )
      res.json(agendamento)
    } catch (err) {
      next(err)
    }
  })

  // PUT /agendamentos/:id - Atualiza observação/status do agendamento
  router.put('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      const { observacao, status } = req.body
      const atualizado = await agendamentoUseCases.atualizarAgendamento(
        req.params.id,
        { observacao, status },
        user.id,
        user.perfis,
      )
      res.json(atualizado)
    } catch (err) {
      next(err)
    }
  })

  // PATCH /agendamentos/:id - Atualiza parcialmente observação/status do agendamento
  router.patch('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      const { observacao, status } = req.body
      const atualizado = await agendamentoUseCases.atualizarAgendamento(
        req.params.id,
        { observacao, status },
        user.id,
        user.perfis,
      )
      res.json(atualizado)
    } catch (err) {
      next(err)
    }
  })

  // DELETE /agendamentos/:id - Exclui agendamento (admin/gestor)
  router.delete('/:id', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!
      await agendamentoUseCases.deletarAgendamento(req.params.id, user.id, user.perfis)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  })

  return router
}
