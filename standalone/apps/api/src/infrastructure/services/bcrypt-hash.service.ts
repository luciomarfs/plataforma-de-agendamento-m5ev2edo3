import bcrypt from 'bcrypt'
import { IHashService } from '../../application/services/ports.js'

export class BcryptHashService implements IHashService {
  private saltRounds = 10

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
