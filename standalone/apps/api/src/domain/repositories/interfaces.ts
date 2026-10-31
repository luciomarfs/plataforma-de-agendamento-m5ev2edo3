import {
  UsuarioEntity,
  OrganizacaoEntity,
  AcessoEntity,
  AcessoEOrganizacaoEntity,
  SlotEntity,
  AgendamentoEntity,
  ContratoEntity,
} from '../entities.js'

export interface IUsuarioRepository {
  findById(id: string): Promise<UsuarioEntity | null>
  findByEmail(email: string): Promise<UsuarioEntity | null>
  create(usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity>
  update(id: string, usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity>
  listAll(): Promise<UsuarioEntity[]>
}

export interface IAcessoRepository {
  findByUsuarioId(id_usuario: string): Promise<AcessoEntity | null>
  saveOrUpdate(id_usuario: string, perfis: string[]): Promise<AcessoEntity>
  listAll(): Promise<AcessoEntity[]>
}

export interface IAcessoEOrganizacaoRepository {
  findByUserAndOrg(
    id_usuario: string,
    id_organizacao: string,
  ): Promise<AcessoEOrganizacaoEntity | null>
  listByOrg(id_organizacao: string): Promise<AcessoEOrganizacaoEntity[]>
  listByUser(id_usuario: string): Promise<AcessoEOrganizacaoEntity[]>
  create(vinculo: AcessoEOrganizacaoEntity): Promise<AcessoEOrganizacaoEntity>
  delete(id_usuario: string, id_organizacao: string): Promise<void>
}

export interface IOrganizacaoRepository {
  findById(id: string): Promise<OrganizacaoEntity | null>
  findByCodigo(codigo: string): Promise<OrganizacaoEntity | null>
  listAll(): Promise<OrganizacaoEntity[]>
  create(org: Partial<OrganizacaoEntity>): Promise<OrganizacaoEntity>
  update(id: string, org: Partial<OrganizacaoEntity>): Promise<OrganizacaoEntity>
  delete(id: string): Promise<void>
}

export interface ISlotRepository {
  findById(id: string, trx?: any): Promise<SlotEntity | null>
  list(options?: {
    organizacaoId?: string
    data?: string
    apenasAtivos?: boolean
  }): Promise<SlotEntity[]>
  create(slot: Partial<SlotEntity>): Promise<SlotEntity>
  update(id: string, slot: Partial<SlotEntity>, trx?: any): Promise<SlotEntity>
  delete(id: string): Promise<void>
  incrementarOcupacao(id_slot: string, trx?: any): Promise<SlotEntity>
  decrementarOcupacao(id_slot: string, trx?: any): Promise<SlotEntity>
}

export interface IAgendamentoRepository {
  findById(id: string, trx?: any): Promise<AgendamentoEntity | null>
  listByUsuario(id_usuario: string): Promise<AgendamentoEntity[]>
  listByOrganizacao(id_organizacao: string): Promise<AgendamentoEntity[]>
  findExistente(id_slot: string, id_usuario: string): Promise<AgendamentoEntity | null>
  create(agendamento: Partial<AgendamentoEntity>, trx?: any): Promise<AgendamentoEntity>
  updateStatus(
    id: string,
    status: AgendamentoEntity['status'],
    trx?: any,
  ): Promise<AgendamentoEntity>
  countPorPeriodo(options: {
    id_usuario: string
    id_organizacao: string
    data: string // YYYY-MM-DD
  }): Promise<{ dia: number; semana: number; mes: number }>
}

export interface IContratoRepository {
  findById(id: string, trx?: any): Promise<ContratoEntity | null>
  findAtivo(id_usuario: string, id_organizacao: string, trx?: any): Promise<ContratoEntity | null>
  list(options?: { id_usuario?: string; id_organizacao?: string }): Promise<ContratoEntity[]>
  create(contrato: Partial<ContratoEntity>): Promise<ContratoEntity>
  update(id: string, contrato: Partial<ContratoEntity>, trx?: any): Promise<ContratoEntity>
  delete(id: string): Promise<void>
  debitarSlot(id_contrato: string, trx?: any): Promise<ContratoEntity>
  estornarSlot(id_contrato: string, trx?: any): Promise<ContratoEntity>
}

export interface IUnitOfWork {
  startTransaction<T>(work: (trx: any) => Promise<T>): Promise<T>
}
