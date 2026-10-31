import { Router, Request, Response, NextFunction } from 'express'
import { EmpresaUseCases } from '../../../application/use-cases/empresa.use-case.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import { ITokenService } from '../../../application/services/ports.js'

export function createDashboardRouter(
  empresaUseCases: EmpresaUseCases,
  tokenService: ITokenService,
): Router {
  const router = Router()
  const auth = authMiddleware(tokenService)

  // GET /dashboard/metricas
  router.get(
    '/metricas',
    auth,
    requireRole('admin', 'gestor', 'profissional'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id_organizacao } = req.query
        const metricas = await empresaUseCases.obterMetricasDashboard(
          id_organizacao as string | undefined,
        )
        res.json(metricas)
      } catch (err) {
        next(err)
      }
    },
  )

  // GET /dashboard/backlog
  router.get(
    '/backlog',
    auth,
    requireRole('admin', 'gestor', 'profissional'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id_organizacao } = req.query
        const backlog = await empresaUseCases.obterBacklog(id_organizacao as string | undefined)
        res.json(backlog)
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
