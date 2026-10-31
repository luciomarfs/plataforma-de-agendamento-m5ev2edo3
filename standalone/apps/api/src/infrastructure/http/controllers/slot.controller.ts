import { Router, Request, Response, NextFunction } from 'express'
import { EmpresaUseCases } from '../../../application/use-cases/empresa.use-case.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import { ITokenService } from '../../../application/services/ports.js'

export function createSlotRouter(
  empresaUseCases: EmpresaUseCases,
  tokenService: ITokenService,
): Router {
  const router = Router()
  const auth = authMiddleware(tokenService)

  // GET /slots - Lista slots com filtros (organizacaoId, data, apenasAtivos)
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizacaoId, data, apenasAtivos } = req.query
      const slots = await empresaUseCases.listarSlots({
        organizacaoId: organizacaoId as string | undefined,
        data: data as string | undefined,
        apenasAtivos: apenasAtivos !== undefined ? apenasAtivos === 'true' : true,
      })
      res.json(slots)
    } catch (err) {
      next(err)
    }
  })

  // POST /slots - Cria um slot individual (admin/gestor/profissional)
  router.post(
    '/',
    auth,
    requireRole('admin', 'gestor', 'profissional'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id_organizacao, id_profissional, data, inicio, fim, recurso, quantidade, ativo } =
          req.body
        if (!id_organizacao || !data || !inicio || !fim || !recurso) {
          res
            .status(400)
            .json({ error: 'id_organizacao, data, inicio, fim e recurso são obrigatórios.' })
          return
        }
        const slot = await empresaUseCases.criarSlot({
          id_organizacao,
          id_profissional: id_profissional || null,
          data,
          inicio,
          fim,
          recurso,
          quantidade: quantidade ? Number(quantidade) : 1,
          ativo: ativo !== undefined ? ativo : true,
        })
        res.status(201).json(slot)
      } catch (err) {
        next(err)
      }
    },
  )

  // POST /slots/lote - Geração de grade de horários em lote
  router.post(
    '/lote',
    auth,
    requireRole('admin', 'gestor', 'profissional'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { slots } = req.body
        if (!Array.isArray(slots) || slots.length === 0) {
          res.status(400).json({ error: 'Envie um array de slots não vazio.' })
          return
        }
        const criados = await empresaUseCases.criarSlotsLote(slots)
        res.status(201).json(criados)
      } catch (err) {
        next(err)
      }
    },
  )

  // PATCH /slots/:id - Atualiza slot
  router.patch(
    '/:id',
    auth,
    requireRole('admin', 'gestor', 'profissional'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const atualizado = await empresaUseCases.atualizarSlot(req.params.id, req.body)
        res.json(atualizado)
      } catch (err) {
        next(err)
      }
    },
  )

  // DELETE /slots/:id - Deleta slot
  router.delete(
    '/:id',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await empresaUseCases.deletarSlot(req.params.id)
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
