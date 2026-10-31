import { Router, Request, Response, NextFunction } from 'express'
import { EmpresaUseCases } from '../../../application/use-cases/empresa.use-case.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import { ITokenService } from '../../../application/services/ports.js'

export function createOrganizacaoRouter(
  empresaUseCases: EmpresaUseCases,
  tokenService: ITokenService,
): Router {
  const router = Router()
  const auth = authMiddleware(tokenService)

  // GET /organizacoes - Aberto para autenticados ou lista pública
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const orgs = await empresaUseCases.listarOrganizacoes()
      res.json(orgs)
    } catch (err) {
      next(err)
    }
  })

  // GET /organizacoes/:id
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await empresaUseCases.obterOrganizacao(req.params.id)
      res.json(org)
    } catch (err) {
      next(err)
    }
  })

  // POST /organizacoes - Apenas gestor/admin
  router.post(
    '/',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { codigo, nome, descricao, telefone, endereco } = req.body
        if (!nome) {
          res.status(400).json({ error: 'Nome da organização é obrigatório.' })
          return
        }
        const nova = await empresaUseCases.criarOrganizacao({
          codigo: codigo || `ORG-${Date.now().toString(36).toUpperCase()}`,
          nome,
          descricao,
          telefone,
          endereco,
        })
        res.status(201).json(nova)
      } catch (err) {
        next(err)
      }
    },
  )

  // PUT /organizacoes/:id - Substituição/atualização completa
  router.put(
    '/:id',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { codigo, nome, descricao, telefone, endereco } = req.body
        if (!nome) {
          res.status(400).json({ error: 'Nome da organização é obrigatório.' })
          return
        }
        const atualizada = await empresaUseCases.atualizarOrganizacao(req.params.id, {
          codigo,
          nome,
          descricao: descricao || null,
          telefone: telefone || null,
          endereco: endereco || null,
        })
        res.json(atualizada)
      } catch (err) {
        next(err)
      }
    },
  )

  // PATCH /organizacoes/:id
  router.patch(
    '/:id',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const atualizada = await empresaUseCases.atualizarOrganizacao(req.params.id, req.body)
        res.json(atualizada)
      } catch (err) {
        next(err)
      }
    },
  )

  // DELETE /organizacoes/:id
  router.delete(
    '/:id',
    auth,
    requireRole('admin'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await empresaUseCases.deletarOrganizacao(req.params.id)
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    },
  )

  // GET /organizacoes/:id/vinculos - Profissionais vinculados à org
  router.get('/:id/vinculos', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vinculos = await empresaUseCases.listarVinculosOrg(req.params.id)
      res.json(vinculos)
    } catch (err) {
      next(err)
    }
  })

  return router
}
