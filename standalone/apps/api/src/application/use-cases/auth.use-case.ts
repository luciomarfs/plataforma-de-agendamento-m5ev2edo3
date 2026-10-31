import { IUsuarioRepository, IAcessoRepository } from '../../domain/repositories/interfaces.js'
import { IHashService, ITokenService, IMailerService } from '../services/ports.js'
import { DomainError, UnauthorizedError, NotFoundError } from '../../domain/errors.js'

export class AuthUseCases {
  constructor(
    private usuarioRepo: IUsuarioRepository,
    private acessoRepo: IAcessoRepository,
    private hashService: IHashService,
    private tokenService: ITokenService,
    private mailerService?: IMailerService,
  ) {}

  async registrar(dados: { name: string; email: string; password: string; perfis?: string[] }) {
    const emailNorm = dados.email.trim().toLowerCase()
    const existente = await this.usuarioRepo.findByEmail(emailNorm)
    if (existente) {
      throw new DomainError('Já existe um usuário cadastrado com este e-mail.', 409)
    }

    const hashedPassword = await this.hashService.hash(dados.password)
    const usuario = await this.usuarioRepo.create({
      name: dados.name.trim(),
      email: emailNorm,
      password: hashedPassword,
      created_at: new Date(),
      update_at: new Date(),
    })

    const perfis = dados.perfis && dados.perfis.length > 0 ? dados.perfis : ['usuario']
    await this.acessoRepo.saveOrUpdate(usuario.id, perfis)

    // Enviar e-mail de boas-vindas / ativação
    if (this.mailerService) {
      try {
        await this.mailerService.sendMail({
          to: usuario.email,
          subject: 'Bem-vindo à Plataforma de Agendamento',
          text: `Olá ${usuario.name}, sua conta foi criada com sucesso! Acesse a plataforma com seu e-mail e senha.`,
        })
      } catch (err) {
        console.warn('[Auth] Erro ao enviar email de boas-vindas:', err)
      }
    }

    const token = this.tokenService.generateToken({
      id: usuario.id,
      email: usuario.email,
      perfis,
    })

    return {
      token,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        perfis,
      },
    }
  }

  async login(credenciais: { email: string; password: string }) {
    const emailNorm = credenciais.email.trim().toLowerCase()
    const usuario = await this.usuarioRepo.findByEmail(emailNorm)
    if (!usuario || !usuario.password) {
      throw new UnauthorizedError('Credenciais inválidas. Verifique seu e-mail e senha.')
    }

    const senhaOk = await this.hashService.compare(credenciais.password, usuario.password)
    if (!senhaOk) {
      throw new UnauthorizedError('Credenciais inválidas. Verifique seu e-mail e senha.')
    }

    const acesso = await this.acessoRepo.findByUsuarioId(usuario.id)
    const perfis = acesso?.perfis || ['usuario']

    const token = this.tokenService.generateToken({
      id: usuario.id,
      email: usuario.email,
      perfis: perfis as string[],
    })

    return {
      token,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        perfis,
      },
    }
  }

  async esqueciSenha(email: string) {
    const usuario = await this.usuarioRepo.findByEmail(email.trim().toLowerCase())
    if (!usuario) {
      // Retorna sucesso para evitar enumeração de usuários
      return { message: 'Se o e-mail existir, as instruções foram geradas.', resetToken: null }
    }
    const resetToken = this.tokenService.generateResetToken(usuario.id)

    if (this.mailerService) {
      try {
        await this.mailerService.sendMail({
          to: usuario.email,
          subject: 'Redefinição de Senha - Plataforma de Agendamento',
          text: `Olá ${usuario.name}, para redefinir sua senha utilize o token: ${resetToken}`,
        })
      } catch (err) {
        console.warn('[Auth] Erro ao enviar email de redefinição:', err)
      }
    }

    return {
      message: 'Se o e-mail existir, as instruções foram enviadas.',
      resetToken, // Retornado também para facilitar testes locais e API
    }
  }

  async redefinirSenha(token: string, novaSenha: string) {
    const decoded = this.tokenService.verifyResetToken(token)
    const usuario = await this.usuarioRepo.findById(decoded.userId)
    if (!usuario) {
      throw new NotFoundError('Usuário não encontrado para este token.')
    }

    const hashedPassword = await this.hashService.hash(novaSenha)
    await this.usuarioRepo.update(usuario.id, {
      password: hashedPassword,
      update_at: new Date(),
    })

    return { success: true, message: 'Senha redefinida com sucesso.' }
  }

  async alterarSenha(userId: string, senhaAtual: string, novaSenha: string) {
    const usuario = await this.usuarioRepo.findById(userId)
    if (!usuario || !usuario.password) {
      throw new NotFoundError('Usuário não encontrado.')
    }

    const senhaValida = await this.hashService.compare(senhaAtual, usuario.password)
    if (!senhaValida) {
      throw new DomainError('A senha atual fornecida está incorreta.', 400)
    }

    const hashedPassword = await this.hashService.hash(novaSenha)
    await this.usuarioRepo.update(usuario.id, {
      password: hashedPassword,
      update_at: new Date(),
    })

    return { success: true, message: 'Senha alterada com sucesso.' }
  }
}
