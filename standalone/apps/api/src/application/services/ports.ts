export interface ITokenService {
  generateToken(payload: { id: string; email: string; perfis: string[] }): string;
  verifyToken(token: string): { id: string; email: string; perfis: string[] };
  generateResetToken(userId: string): string;
  verifyResetToken(token: string): { userId: string };
}

export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
