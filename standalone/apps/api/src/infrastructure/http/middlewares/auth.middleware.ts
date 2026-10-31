import { Request, Response, NextFunction } from 'express'
import { ITokenService } from '../application/services/ports.js'
import { UnauthorizedError } from '../domain/errors.js'

export interface AuthenticatedUser {
  id: string
  email: string
  perfis: string[]
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export function authMiddleware(tokenService: ITokenService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: 'Token de autenticação não fornecido.' })
      return
    }

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token) {
      res
        .status(401)
        .json({ error: 'Formato do cabeçalho de autenticação inválido. Use "Bearer <token>".' })
      return
    }

    try {
      const payload = tokenService.verifyToken(token)
      req.user = payload
      next()
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Token inválido ou expirado.' })
    }
  }
}

export function requireRole(...perfisPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' })
      return
    }

    const temPermissao = req.user.perfis.some((p) => perfisPermitidos.includes(p))
    if (!temPermissao) {
      res.status(403).json({ error: 'Acesso negado: permissões insuficientes para esta operação.' })
      return
    }

    next()
  }
}
