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
   * Caso de uso: Agendar sessão no servidor (atômico)
   * Executa rota REST /backend/v1/agendamentos com token PocketBase.
   * Valida capacidade, contrato ativo, saldo e unicidade no servidor.
   */
  async agendar(
    input: CreateAgendamentoInput,
  ): Promise<{ agendamento: Agendamento; slot: Slot; contrato: Contrato }> {
    try {
      const res = await pb.send<{
        success: boolean
        agendamento: Agendamento
        slot: Slot
        contrato: Contrato
      }>('/backend/v1/agendamentos', {
        method: 'POST',
        body: {
          id_slot: input.id_slot,
          id_usuario: input.id_usuario,
          id_organizacao: input.id_organizacao,
          observacao: input.observacao || '',
        },
      })

      return {
        agendamento: res.agendamento,
        slot: res.slot,
        contrato: res.contrato,
      }
    } catch (err: any) {
      const serverMessage =
        err?.response?.message ||
        err?.data?.message ||
        err?.message ||
        'Não foi possível realizar o agendamento.'
      throw new Error(serverMessage)
    }
  },

  /**
   * Caso de uso: Cancelar agendamento no servidor (atômico)
   * Executa rota REST /backend/v1/agendamentos/{id}/cancelar com token PocketBase.
   * Valida autorização do usuário e estorna vaga e saldo no contrato de forma atômica.
   */
  async cancelar(id_agendamento: string): Promise<{ agendamento: Agendamento }> {
    try {
      const res = await pb.send<{
        success: boolean
        message: string
        agendamento: Agendamento
      }>(`/backend/v1/agendamentos/${id_agendamento}/cancelar`, {
        method: 'POST',
      })

      return { agendamento: res.agendamento }
    } catch (err: any) {
      const serverMessage =
        err?.response?.message ||
        err?.data?.message ||
        err?.message ||
        'Não foi possível cancelar o agendamento.'
      throw new Error(serverMessage)
    }
  },
}
