import { Router, Request, Response, NextFunction } from 'express'
import { EmpresaUseCases } from '../../../application/use-cases/empresa.use-case.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import { ITokenService } from '../../../application/services/ports.js'

export function createProfissionalRouter(
  empresaUseCases: EmpresaUseCases,
  tokenService: ITokenService,
): Router {
  const router = Router()
  const auth = authMiddleware(tokenService)

  // GET /profissionais - Lista todos os usuários que são profissionais ou staff
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const profissionais = await empresaUseCases.listarProfissionais()
      res.json(profissionais)
    } catch (err) {
      next(err)
    }
  })

  // GET /profissionais/usuarios - Lista geral de usuários (para vincular em contratos/profissionais)
  router.get(
    '/usuarios',
    auth,
    requireRole('admin', 'gestor'),
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const usuarios = await empresaUseCases.listarUsuarios()
        res.json(usuarios)
      } catch (err) {
        next(err)
      }
    },
  )

  // GET /profissionais/:id - Detalhes do profissional
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profissional = await empresaUseCases.obterProfissional(req.params.id)
      res.json(profissional)
    } catch (err) {
      next(err)
    }
  })

  // PUT /profissionais/:id - Atualiza dados cadastrais do profissional
  router.put(
    '/:id',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name, email, image } = req.body
        const atualizado = await empresaUseCases.atualizarUsuario(req.params.id, {
          name,
          email,
          image,
        })
        res.json(atualizado)
      } catch (err) {
        next(err)
      }
    },
  )

  // PATCH /profissionais/:id - Atualiza parcialmente dados cadastrais do profissional
  router.patch(
    '/:id',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name, email, image } = req.body
        const atualizado = await empresaUseCases.atualizarUsuario(req.params.id, {
          name,
          email,
          image,
        })
        res.json(atualizado)
      } catch (err) {
        next(err)
      }
    },
  )

  // POST /profissionais/vincular - Vincula usuário a uma organização com papel
  router.post(
    '/vincular',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id_usuario, id_organizacao, papel } = req.body
        if (!id_usuario || !id_organizacao) {
          res.status(400).json({ error: 'id_usuario e id_organizacao são obrigatórios.' })
          return
        }
        const vinculo = await empresaUseCases.vincularProfissionalOrg(
          id_usuario,
          id_organizacao,
          papel || 'profissional',
        )
        res.status(201).json(vinculo)
      } catch (err) {
        next(err)
      }
    },
  )

  // DELETE /profissionais/desvincular - Remove vínculo
  router.delete(
    '/desvincular',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id_usuario, id_organizacao } = req.body
        if (!id_usuario || !id_organizacao) {
          res.status(400).json({ error: 'id_usuario e id_organizacao são obrigatórios.' })
          return
        }
        await empresaUseCases.desvincularProfissionalOrg(id_usuario, id_organizacao)
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    },
  )

  // PATCH /profissionais/:id/perfis - Atualiza perfis de acesso do usuário
  router.patch(
    '/:id/perfis',
    auth,
    requireRole('admin', 'gestor'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { perfis } = req.body
        if (!Array.isArray(perfis)) {
          res.status(400).json({ error: 'perfis deve ser um array de strings.' })
          return
        }
        const atualizado = await empresaUseCases.atualizarPerfisUsuario(req.params.id, perfis)
        res.json(atualizado)
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
