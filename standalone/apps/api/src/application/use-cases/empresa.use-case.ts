import {
  IOrganizacaoRepository,
  ISlotRepository,
  IContratoRepository,
  IUsuarioRepository,
  IAcessoRepository,
  IAcessoEOrganizacaoRepository,
  IAgendamentoRepository,
} from '../../domain/repositories/interfaces.js'
import { DomainError, NotFoundError } from '../../domain/errors.js'

export class EmpresaUseCases {
  constructor(
    private orgRepo: IOrganizacaoRepository,
    private slotRepo: ISlotRepository,
    private contratoRepo: IContratoRepository,
    private userRepo: IUsuarioRepository,
    private acessoRepo: IAcessoRepository,
    private vinculoRepo: IAcessoEOrganizacaoRepository,
    private agendamentoRepo: IAgendamentoRepository,
  ) {}

  // Organizações
  async listarOrganizacoes() {
    return this.orgRepo.listAll()
  }

  async obterOrganizacao(id: string) {
    const org = await this.orgRepo.findById(id)
    if (!org) throw new NotFoundError('Organização não encontrada.')
    return org
  }

  async criarOrganizacao(dados: {
    codigo: string
    nome: string
    descricao?: string
    telefone?: string
    endereco?: string
  }) {
    const existe = await this.orgRepo.findByCodigo(dados.codigo)
    if (existe) throw new DomainError('Já existe organização com este código.', 409)
    return this.orgRepo.create(dados)
  }

  async atualizarOrganizacao(id: string, dados: any) {
    return this.orgRepo.update(id, dados)
  }

  async deletarOrganizacao(id: string) {
    return this.orgRepo.delete(id)
  }

  // Profissionais & Usuários
  async listarUsuarios() {
    return this.userRepo.listAll()
  }

  async obterUsuario(id: string) {
    const usuario = await this.userRepo.findById(id)
    if (!usuario) throw new NotFoundError('Usuário não encontrado.')
    const acesso = await this.acessoRepo.findByUsuarioId(id)
    return {
      ...usuario,
      perfis: acesso?.perfis || ['usuario'],
    }
  }

  async atualizarUsuario(id: string, dados: { name?: string; email?: string; image?: string }) {
    const usuario = await this.userRepo.findById(id)
    if (!usuario) throw new NotFoundError('Usuário não encontrado.')
    return this.userRepo.update(id, dados)
  }

  async listarProfissionais() {
    const [usuarios, acessos] = await Promise.all([
      this.userRepo.listAll(),
      this.acessoRepo.listAll(),
    ])

    const acessosMap = new Map(acessos.map((a) => [a.id_usuario, a.perfis]))
    return usuarios.filter((u) => {
      const perfis = acessosMap.get(u.id) || []
      return (
        perfis.includes('profissional') || perfis.includes('admin') || perfis.includes('gestor')
      )
    })
  }

  async obterProfissional(id: string) {
    const usuario = await this.obterUsuario(id)
    const perfis = usuario.perfis || []
    const isProfissional =
      perfis.includes('profissional') || perfis.includes('admin') || perfis.includes('gestor')
    if (!isProfissional) {
      throw new NotFoundError('Profissional não encontrado.')
    }
    return usuario
  }

  async atualizarPerfisUsuario(id_usuario: string, perfis: string[]) {
    return this.acessoRepo.saveOrUpdate(id_usuario, perfis)
  }

  async vincularProfissionalOrg(
    id_usuario: string,
    id_organizacao: string,
    papel = 'profissional',
  ) {
    return this.vinculoRepo.create({
      id_usuario,
      id_organizacao,
      papel: papel as any,
      assigned_at: new Date(),
    })
  }

  async desvincularProfissionalOrg(id_usuario: string, id_organizacao: string) {
    return this.vinculoRepo.delete(id_usuario, id_organizacao)
  }

  async listarVinculosOrg(id_organizacao: string) {
    return this.vinculoRepo.listByOrg(id_organizacao)
  }

  // Slots (Agenda)
  async listarSlots(options?: { organizacaoId?: string; data?: string; apenasAtivos?: boolean }) {
    return this.slotRepo.list(options)
  }

  async obterSlot(id: string) {
    const slot = await this.slotRepo.findById(id)
    if (!slot) throw new NotFoundError('Horário (slot) não encontrado.')
    return slot
  }

  async criarSlot(dados: {
    id_organizacao: string
    id_profissional?: string | null
    data: string
    inicio: string
    fim: string
    recurso: string
    quantidade: number
    ativo?: boolean
  }) {
    return this.slotRepo.create(dados)
  }

  async criarSlotsLote(slots: any[]) {
    const criados = []
    for (const item of slots) {
      criados.push(await this.slotRepo.create(item))
    }
    return criados
  }

  async atualizarSlot(id: string, dados: any) {
    await this.obterSlot(id)
    return this.slotRepo.update(id, dados)
  }

  async deletarSlot(id: string) {
    await this.obterSlot(id)
    return this.slotRepo.delete(id)
  }

  // Contratos
  async listarContratos(options?: { id_usuario?: string; id_organizacao?: string }) {
    return this.contratoRepo.list(options)
  }

  async obterContrato(id: string) {
    const contrato = await this.contratoRepo.findById(id)
    if (!contrato) throw new NotFoundError('Contrato não encontrado.')
    return contrato
  }

  async criarContrato(dados: any) {
    return this.contratoRepo.create(dados)
  }

  async atualizarContrato(id: string, dados: any) {
    await this.obterContrato(id)
    return this.contratoRepo.update(id, dados)
  }

  async deletarContrato(id: string) {
    await this.obterContrato(id)
    return this.contratoRepo.delete(id)
  }

  // Backlog e Métricas Dashboard
  async obterBacklog(id_organizacao?: string) {
    const agendamentos = id_organizacao
      ? await this.agendamentoRepo.listByOrganizacao(id_organizacao)
      : []
    return agendamentos
  }

  async obterMetricasDashboard(id_organizacao?: string) {
    const [orgs, slots, contratos] = await Promise.all([
      this.orgRepo.listAll(),
      this.slotRepo.list({ organizacaoId: id_organizacao }),
      this.contratoRepo.list({ id_organizacao }),
    ])

    return {
      orgsCount: orgs.length,
      slotsCount: slots.length,
      contratosCount: contratos.length,
    }
  }
}
