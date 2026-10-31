import { Router, Request, Response, NextFunction } from 'express'
import { AuthUseCases } from '../../../application/use-cases/auth.use-case.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { ITokenService } from '../../../application/services/ports.js'
import { IUsuarioRepository, IAcessoRepository } from '../../../domain/repositories/interfaces.js'

export function createAuthRouter(
  authUseCases: AuthUseCases,
  tokenService: ITokenService,
  usuarioRepo: IUsuarioRepository,
  acessoRepo: IAcessoRepository,
): Router {
  const router = Router()

  // POST /auth/register
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, perfis } = req.body
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' })
        return
      }
      const result = await authUseCases.registrar({ name, email, password, perfis })
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  })

  // POST /auth/login
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        res.status(400).json({ error: 'E-mail e senha são obrigatórios.' })
        return
      }
      const result = await authUseCases.login({ email, password })
      res.json(result)
    } catch (err) {
      next(err)
    }
  })

  // POST /auth/refresh
  router.post(
    '/refresh',
    authMiddleware(tokenService),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user!
        const freshUser = await usuarioRepo.findById(user.id)
        if (!freshUser) {
          res.status(404).json({ error: 'Usuário não encontrado.' })
          return
        }
        const freshAcesso = await acessoRepo.findByUsuarioId(user.id)
        const perfis = (freshAcesso?.perfis || ['usuario']) as string[]

        const newToken = tokenService.generateToken({
          id: freshUser.id,
          email: freshUser.email,
          perfis,
        })

        res.json({
          token: newToken,
          user: {
            id: freshUser.id,
            name: freshUser.name,
            email: freshUser.email,
            perfis,
          },
        })
      } catch (err) {
        next(err)
      }
    },
  )

  // GET /auth/me
  router.get(
    '/me',
    authMiddleware(tokenService),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user!
        const fullUser = await usuarioRepo.findById(user.id)
        if (!fullUser) {
          res.status(404).json({ error: 'Usuário não encontrado.' })
          return
        }
        const acesso = await acessoRepo.findByUsuarioId(user.id)
        res.json({
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          image: fullUser.image,
          perfis: acesso?.perfis || ['usuario'],
        })
      } catch (err) {
        next(err)
      }
    },
  )

  // POST /auth/forgot-password
  router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body
      if (!email) {
        res.status(400).json({ error: 'E-mail é obrigatório.' })
        return
      }
      const result = await authUseCases.esqueciSenha(email)
      res.json(result)
    } catch (err) {
      next(err)
    }
  })

  // POST /auth/reset-password
  router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body
      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token e nova senha são obrigatórios.' })
        return
      }
      const result = await authUseCases.redefinirSenha(token, newPassword)
      res.json(result)
    } catch (err) {
      next(err)
    }
  })

  // POST /auth/change-password
  router.post(
    '/change-password',
    authMiddleware(tokenService),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword) {
          res.status(400).json({ error: 'Senha atual e nova senha são obrigatórios.' })
          return
        }
        const result = await authUseCases.alterarSenha(req.user!.id, currentPassword, newPassword)
        res.json(result)
      } catch (err) {
        next(err)
      }
    },
  )

  return router
}
