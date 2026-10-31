import {
  ISlotRepository,
  IContratoRepository,
  IAgendamentoRepository,
  IOrganizacaoRepository,
  IUsuarioRepository,
  IAcessoRepository,
  IAcessoEOrganizacaoRepository,
  IUnitOfWork,
} from '../../domain/repositories/interfaces.js'
import { DomainError, NotFoundError, ForbiddenError } from '../../domain/errors.js'

export interface CriarAgendamentoInput {
  id_slot: string
  id_usuario: string // usuário alvo
  id_organizacao?: string
  observacao?: string
  solicitanteId: string
  solicitantePerfis: string[]
}

export interface CancelarAgendamentoInput {
  id_agendamento: string
  solicitanteId: string
  solicitantePerfis: string[]
}

export class AgendamentoUseCases {
  constructor(
    private slotRepo: ISlotRepository,
    private agendamentoRepo: IAgendamentoRepository,
    private contratoRepo: IContratoRepository,
    private orgRepo: IOrganizacaoRepository,
    private userRepo: IUsuarioRepository,
    private acessoRepo: IAcessoRepository,
    private vinculoRepo: IAcessoEOrganizacaoRepository,
    private uow: IUnitOfWork,
  ) {}

  private async isStaffOrAdmin(userId: string, orgId: string, perfis: string[]): Promise<boolean> {
    if (perfis.includes('admin') || perfis.includes('gestor')) {
      return true
    }
    const vinculo = await this.vinculoRepo.findByUserAndOrg(userId, orgId)
    if (
      vinculo &&
      (vinculo.papel === 'admin' || vinculo.papel === 'gestor' || vinculo.papel === 'profissional')
    ) {
      return true
    }
    return false
  }

  async criarAgendamento(input: CriarAgendamentoInput) {
    const { id_slot, solicitanteId, solicitantePerfis, observacao } = input
    const targetUserId = input.id_usuario || solicitanteId

    // 1. Carregar slot para validação
    const slot = await this.slotRepo.findById(id_slot)
    if (!slot) {
      throw new NotFoundError('Horário (slot) não encontrado.')
    }

    const orgId = input.id_organizacao || slot.id_organizacao
    if (slot.id_organizacao !== orgId) {
      throw new DomainError('A organização informada não corresponde ao horário do slot.')
    }

    if (slot.ativo === false) {
      throw new DomainError('Este horário não está ativo para agendamento.')
    }

    // Se estiver agendando para outro usuário, exige perfil staff/admin
    if (targetUserId !== solicitanteId) {
      const isStaff = await this.isStaffOrAdmin(solicitanteId, orgId, solicitantePerfis)
      if (!isStaff) {
        throw new ForbiddenError(
          'Você não tem permissão para realizar agendamentos para outro usuário.',
        )
      }
    }

    // Capacidade pré-transação
    if (slot.quantidade_utilizada >= slot.quantidade) {
      throw new DomainError('Slot lotado. Não há vagas disponíveis para esta sessão.')
    }

    // 2. Verificar se já tem agendamento ativo no slot
    const existente = await this.agendamentoRepo.findExistente(id_slot, targetUserId)
    if (existente && existente.status === 'agendado') {
      throw new DomainError('Você já possui um agendamento confirmado para este horário.')
    }

    // 3. Buscar contrato ativo do usuário na organização
    const contrato = await this.contratoRepo.findAtivo(targetUserId, orgId)
    if (!contrato) {
      throw new DomainError(
        'Nenhum contrato ativo encontrado para esta organização. Solicite a liberação do seu plano.',
      )
    }

    if (contrato.saldo_slots <= 0) {
      throw new DomainError('Sem saldo disponível. Saldo de slots esgotado no seu plano.')
    }

    // 4. Validar limites diário, semanal e mensal
    const limites = await this.agendamentoRepo.countPorPeriodo({
      id_usuario: targetUserId,
      id_organizacao: orgId,
      data: slot.data,
    })

    if (
      contrato.slots_por_dia &&
      contrato.slots_por_dia > 0 &&
      limites.dia >= contrato.slots_por_dia
    ) {
      throw new DomainError(
        `Limite diário atingido. Seu plano permite até ${contrato.slots_por_dia} agendamento(s) por dia.`,
      )
    }
    if (
      contrato.slots_por_semana &&
      contrato.slots_por_semana > 0 &&
      limites.semana >= contrato.slots_por_semana
    ) {
      throw new DomainError(
        `Limite semanal atingido. Seu plano permite até ${contrato.slots_por_semana} agendamento(s) por semana.`,
      )
    }
    if (
      contrato.slots_por_mes &&
      contrato.slots_por_mes > 0 &&
      limites.mes >= contrato.slots_por_mes
    ) {
      throw new DomainError(
        `Limite mensal atingido. Seu plano permite até ${contrato.slots_por_mes} agendamento(s) por mês.`,
      )
    }

    // 5. TRANSAÇÃO ATÔMICA
    const resultado = await this.uow.startTransaction(async (trx) => {
      // Revalida slot com lock de transação
      const currentSlot = await this.slotRepo.findById(id_slot, trx)
      if (!currentSlot || currentSlot.quantidade_utilizada >= currentSlot.quantidade) {
        throw new DomainError('Slot lotado. A vaga acabou de ser preenchida por outro usuário.')
      }

      // Revalida contrato com lock
      const currentContrato = await this.contratoRepo.findById(contrato.id_contrato, trx)
      if (!currentContrato || currentContrato.saldo_slots <= 0) {
        throw new DomainError('Sem saldo disponível no contrato.')
      }

      // Criar agendamento
      const novoAgendamento = await this.agendamentoRepo.create(
        {
          id_slot,
          id_usuario: targetUserId,
          id_organizacao: orgId,
          status: 'agendado',
          observacao: observacao || '',
          created_at: new Date(),
          update_at: new Date(),
        },
        trx,
      )

      // Incrementar quantidade_utilizada do slot
      const updatedSlot = await this.slotRepo.incrementarOcupacao(id_slot, trx)

      // Debitar saldo do contrato
      const updatedContrato = await this.contratoRepo.debitarSlot(contrato.id_contrato, trx)

      return {
        agendamento: novoAgendamento,
        slot: updatedSlot,
        contrato: updatedContrato,
      }
    })

    const organizacao = await this.orgRepo.findById(orgId)
    const usuario = await this.userRepo.findById(targetUserId)

    return {
      success: true,
      agendamento: {
        ...resultado.agendamento,
        expand: {
          id_slot: resultado.slot,
          id_organizacao: organizacao,
          id_usuario: usuario ? { id: usuario.id, name: usuario.name, email: usuario.email } : null,
        },
      },
      slot: resultado.slot,
      contrato: resultado.contrato,
    }
  }

  async cancelarAgendamento(input: CancelarAgendamentoInput) {
    const { id_agendamento, solicitanteId, solicitantePerfis } = input

    const agendamento = await this.agendamentoRepo.findById(id_agendamento)
    if (!agendamento) {
      throw new NotFoundError('Agendamento não encontrado.')
    }

    // Permissão: dono OU staff/admin da organização
    if (agendamento.id_usuario !== solicitanteId) {
      const isStaff = await this.isStaffOrAdmin(
        solicitanteId,
        agendamento.id_organizacao,
        solicitantePerfis,
      )
      if (!isStaff) {
        throw new ForbiddenError(
          'Apenas o dono do agendamento ou a equipe da organização pode cancelá-lo.',
        )
      }
    }

    if (agendamento.status === 'cancelado') {
      return {
        success: true,
        message: 'Agendamento já estava cancelado.',
        agendamento,
      }
    }

    // TRANSAÇÃO ATÔMICA DE ESTORNO
    const resultado = await this.uow.startTransaction(async (trx) => {
      // 1. Atualizar agendamento para cancelado
      const updatedAg = await this.agendamentoRepo.updateStatus(id_agendamento, 'cancelado', trx)

      // 2. Decrementar quantidade_utilizada do slot
      let updatedSlot = null
      if (agendamento.id_slot) {
        try {
          updatedSlot = await this.slotRepo.decrementarOcupacao(agendamento.id_slot, trx)
        } catch (_) {}
      }

      // 3. Estornar saldo no contrato ativo do usuário
      let updatedContrato = null
      const contrato = await this.contratoRepo.findAtivo(
        agendamento.id_usuario,
        agendamento.id_organizacao,
        trx,
      )
      if (contrato) {
        updatedContrato = await this.contratoRepo.estornarSlot(contrato.id_contrato, trx)
      }

      return {
        agendamento: updatedAg,
        slot: updatedSlot,
        contrato: updatedContrato,
      }
    })

    const org = await this.orgRepo.findById(agendamento.id_organizacao)
    const slot = resultado.slot || (await this.slotRepo.findById(agendamento.id_slot))

    return {
      success: true,
      message: 'Agendamento cancelado com sucesso. Vaga e saldo estornados.',
      agendamento: {
        ...resultado.agendamento,
        expand: {
          id_slot: slot,
          id_organizacao: org,
        },
      },
    }
  }

  async listarMeusAgendamentos(id_usuario: string) {
    return this.agendamentoRepo.listByUsuario(id_usuario)
  }

  async listarPorOrganizacao(id_organizacao: string) {
    return this.agendamentoRepo.listByOrganizacao(id_organizacao)
  }
}
