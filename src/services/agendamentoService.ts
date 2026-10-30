import pb from '@/lib/pocketbase/client'
import { Agendamento, Slot, Contrato } from '@/domain/models'

export interface CreateAgendamentoInput {
  id_slot: string
  id_usuario: string
  id_organizacao: string
  observacao?: string
}

export const agendamentoService = {
  async getByUsuario(id_usuario: string): Promise<Agendamento[]> {
    return await pb.collection('agendamento').getFullList<Agendamento>({
      filter: `id_usuario = "${id_usuario}"`,
      sort: '-created',
      expand: 'id_slot,id_usuario,id_organizacao,id_slot.id_profissional',
    })
  },

  async getByOrganizacao(id_organizacao: string): Promise<Agendamento[]> {
    return await pb.collection('agendamento').getFullList<Agendamento>({
      filter: `id_organizacao = "${id_organizacao}"`,
      sort: '-created',
      expand: 'id_slot,id_usuario,id_organizacao',
    })
  },

  async getAll(): Promise<Agendamento[]> {
    return await pb.collection('agendamento').getFullList<Agendamento>({
      sort: '-created',
      expand: 'id_slot,id_usuario,id_organizacao',
    })
  },

  /**
   * Caso de uso: Agendar sessão
   * 1. Verifica se slot existe e tem vaga disponível (quantidade_utilizada < quantidade)
   * 2. Verifica se usuário tem contrato ativo na organização com saldo_slots > 0
   * 3. Cria agendamento com status 'agendado'
   * 4. Incrementa quantidade_utilizada no slot
   * 5. Decrementa saldo_slots no contrato
   */
  async agendar(
    input: CreateAgendamentoInput,
  ): Promise<{ agendamento: Agendamento; slot: Slot; contrato: Contrato }> {
    // 1. Obter slot
    const slot = await pb.collection('slot').getOne<Slot>(input.id_slot, {
      expand: 'id_organizacao,id_profissional',
    })
    if (!slot) {
      throw new Error('Horário (slot) não encontrado.')
    }
    const util = slot.quantidade_utilizada ?? 0
    if (util >= slot.quantidade) {
      throw new Error('Este horário já está com a capacidade máxima lotada.')
    }

    // 2. Verificar se o usuário já agendou este slot
    try {
      const existing = await pb
        .collection('agendamento')
        .getFirstListItem<Agendamento>(
          `id_slot = "${input.id_slot}" && id_usuario = "${input.id_usuario}" && status = "agendado"`,
        )
      if (existing) {
        throw new Error('Você já possui um agendamento confirmado neste mesmo horário.')
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Você já possui')) {
        throw err
      }
    }

    // 3. Obter contrato ativo
    let contrato: Contrato
    try {
      contrato = await pb
        .collection('contrato')
        .getFirstListItem<Contrato>(
          `id_usuario = "${input.id_usuario}" && id_organizacao = "${input.id_organizacao}" && ativo = true`,
        )
    } catch {
      throw new Error(
        'Nenhum contrato ativo encontrado para esta organização. Solicite a liberação do seu plano.',
      )
    }

    if (contrato.saldo_slots <= 0) {
      throw new Error(
        'Saldo de slots esgotado no seu plano. Adquira mais créditos ou renove seu contrato.',
      )
    }

    // 4. Criar agendamento
    const agendamento = await pb.collection('agendamento').create<Agendamento>(
      {
        id_slot: input.id_slot,
        id_usuario: input.id_usuario,
        id_organizacao: input.id_organizacao,
        status: 'agendado',
        observacao: input.observacao || '',
      },
      {
        expand: 'id_slot,id_usuario,id_organizacao',
      },
    )

    // 5. Atualizar slot (+1 utilizada)
    const updatedSlot = await pb.collection('slot').update<Slot>(slot.id, {
      quantidade_utilizada: util + 1,
    })

    // 6. Atualizar contrato (-1 saldo)
    const updatedContrato = await pb.collection('contrato').update<Contrato>(contrato.id, {
      saldo_slots: Math.max(0, contrato.saldo_slots - 1),
    })

    return {
      agendamento,
      slot: updatedSlot,
      contrato: updatedContrato,
    }
  },

  /**
   * Caso de uso: Cancelar agendamento
   * 1. Verifica se agendamento está 'agendado'
   * 2. Atualiza status para 'cancelado'
   * 3. Decrementa quantidade_utilizada no slot
   * 4. Devolve +1 saldo_slots no contrato do usuário
   */
  async cancelar(id_agendamento: string): Promise<{ agendamento: Agendamento }> {
    const agendamento = await pb.collection('agendamento').getOne<Agendamento>(id_agendamento, {
      expand: 'id_slot,id_usuario,id_organizacao',
    })

    if (agendamento.status === 'cancelado') {
      return { agendamento }
    }

    // Atualiza status do agendamento
    const updatedAgendamento = await pb.collection('agendamento').update<Agendamento>(
      id_agendamento,
      {
        status: 'cancelado',
      },
      {
        expand: 'id_slot,id_usuario,id_organizacao',
      },
    )

    // Devolve vaga no slot
    if (agendamento.id_slot) {
      try {
        const slot = await pb.collection('slot').getOne<Slot>(agendamento.id_slot)
        const novoUtil = Math.max(0, (slot.quantidade_utilizada ?? 1) - 1)
        await pb.collection('slot').update(slot.id, {
          quantidade_utilizada: novoUtil,
        })
      } catch (e) {
        console.warn('Erro ao atualizar slot no cancelamento:', e)
      }
    }

    // Devolve saldo no contrato
    try {
      const contrato = await pb
        .collection('contrato')
        .getFirstListItem<Contrato>(
          `id_usuario = "${agendamento.id_usuario}" && id_organizacao = "${agendamento.id_organizacao}" && ativo = true`,
        )
      if (contrato) {
        await pb.collection('contrato').update(contrato.id, {
          saldo_slots: contrato.saldo_slots + 1,
        })
      }
    } catch (e) {
      console.warn('Erro ao devolver saldo no cancelamento:', e)
    }

    return { agendamento: updatedAgendamento }
  },
}
