import { Router, Request, Response, NextFunction } from 'express'
import { EmpresaUseCases } from '../../../application/use-cases/empresa.use-case.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import { ITokenService } from '../../../application/services/ports.js'

export function createContratoRouter(
  empresaUseCases: EmpresaUseCases,
  tokenService: ITokenService,
): Router {
  const router = Router()
  const auth = authMiddleware(tokenService)

  // GET /contratos - Lista contratos (com filtro de id_usuario ou id_organizacao)
  router.get('/', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_usuario, id_organizacao } = req.query
      const user = req.user!

      // Se for usuário comum sem perfil staff/admin, só pode ver seus próprios contratos
      const isStaff = user.perfis.some((p) => ['admin', 'gestor', 'profissional'].includes(p))
      const targetUserId = isStaff ? (id_usuario as string | undefined) : user.id

      const contratos = await empresaUseCases.listarContratos({
        id_usuario: targetUserId,
        id_organizacao: id_organizacao as string | undefined,
      })

      res.json(contratos)
    } catch (err) {
      next(err)
    }
  })

  // POST /contratos - Criação de contrato (admin/gestor)
  router.post(
    '/',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const {
          id_usuario,
          id_organizacao,
          ativo,
          data_inicio,
          data_fim,
          slots_por_dia,
          slots_por_semana,
          slots_por_mes,
          saldo_slots,
          plano_nome,
        } = req.body

        if (!id_usuario || !id_organizacao || !data_inicio || !data_fim) {
          res
            .status(400)
            .json({ error: 'id_usuario, id_organizacao, data_inicio e data_fim são obrigatórios.' })
          return
        }

        const contrato = await empresaUseCases.criarContrato({
          id_usuario,
          id_organizacao,
          ativo: ativo !== undefined ? ativo : true,
          data_inicio,
          data_fim,
          slots_por_dia: slots_por_dia ? Number(slots_por_dia) : null,
          slots_por_semana: slots_por_semana ? Number(slots_por_semana) : null,
          slots_por_mes: slots_por_mes ? Number(slots_por_mes) : null,
          saldo_slots: saldo_slots !== undefined ? Number(saldo_slots) : 10,
          plano_nome: plano_nome || 'Plano Padrão',
        })

        res.status(201).json(contrato)
      } catch (err) {
        next(err)
      }
    },
  )

  // PATCH /contratos/:id - Atualiza contrato (saldo, vigência, limites)
  router.patch(
    '/:id',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const atualizado = await empresaUseCases.atualizarContrato(req.params.id, req.body)
        res.json(atualizado)
      } catch (err) {
        next(err)
      }
    },
  )

  // DELETE /contratos/:id - Deleta contrato
  router.delete(
    '/:id',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await empresaUseCases.deletarContrato(req.params.id)
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
