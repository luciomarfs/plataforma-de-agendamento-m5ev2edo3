import jwt from 'jsonwebtoken'
import { ITokenService } from '../../application/services/ports.js'
import { UnauthorizedError } from '../../domain/errors.js'

export class JwtTokenService implements ITokenService {
  private secret: string
  private expiresIn: string

  constructor(
    secret = process.env.JWT_SECRET || 'secret_jwt_saveincloud_default',
    expiresIn = '7d',
  ) {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  generateToken(payload: { id: string; email: string; perfis: string[] }): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any })
  }

  verifyToken(token: string): { id: string; email: string; perfis: string[] } {
    try {
      return jwt.verify(token, this.secret) as { id: string; email: string; perfis: string[] }
    } catch (_) {
      throw new UnauthorizedError('Token de autenticação inválido ou expirado.')
    }
  }

  generateResetToken(userId: string): string {
    return jwt.sign({ userId, type: 'reset_password' }, this.secret, { expiresIn: '1h' })
  }

  verifyResetToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.secret) as { userId: string; type: string }
      if (decoded.type !== 'reset_password') {
        throw new Error('Tipo de token inválido.')
      }
      return { userId: decoded.userId }
    } catch (_) {
      throw new UnauthorizedError('Token de redefinição de senha inválido ou expirado.')
    }
  }
}
