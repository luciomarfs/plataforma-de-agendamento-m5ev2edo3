import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { AgendamentoEntity } from '../../../domain/entities.js'
import { IAgendamentoRepository } from '../../../domain/repositories/interfaces.js'

export class KnexAgendamentoRepository implements IAgendamentoRepository {
  constructor(private knex: Knex) {}

  private getQuery(trx?: any): Knex.QueryBuilder {
    return trx ? trx('agendamento') : this.knex('agendamento')
  }

  async findById(id: string, trx?: any): Promise<AgendamentoEntity | null> {
    const query = this.getQuery(trx).where({ id_agendamento: id })
    const row = await query.first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async listByUsuario(id_usuario: string): Promise<AgendamentoEntity[]> {
    const rows = await this.knex('agendamento')
      .leftJoin('slot', 'agendamento.id_slot', 'slot.id_slot')
      .leftJoin('organizacao', 'agendamento.id_organizacao', 'organizacao.id_organizacao')
      .where({ 'agendamento.id_usuario': id_usuario })
      .select(
        'agendamento.*',
        'slot.data as slot_data',
        'slot.inicio as slot_inicio',
        'slot.fim as slot_fim',
        'slot.recurso as slot_recurso',
        'organizacao.nome as org_nome',
        'organizacao.telefone as org_telefone',
        'organizacao.endereco as org_endereco',
      )
      .orderBy('agendamento.created_at', 'desc')

    return rows.map((r: any) => {
      const entity = this.mapToEntity(r)
      ;(entity as any).expand = {
        id_slot: {
          id_slot: r.id_slot,
          data: r.slot_data instanceof Date ? r.slot_data.toISOString().split('T')[0] : r.slot_data,
          inicio: r.slot_inicio,
          fim: r.slot_fim,
          recurso: r.slot_recurso,
        },
        id_organizacao: {
          id_organizacao: r.id_organizacao,
          nome: r.org_nome,
          telefone: r.org_telefone,
          endereco: r.org_endereco,
        },
      }
      return entity
    })
  }

  async listByOrganizacao(id_organizacao: string): Promise<AgendamentoEntity[]> {
    const rows = await this.knex('agendamento')
      .leftJoin('usuario', 'agendamento.id_usuario', 'usuario.id')
      .leftJoin('slot', 'agendamento.id_slot', 'slot.id_slot')
      .where({ 'agendamento.id_organizacao': id_organizacao })
      .select(
        'agendamento.*',
        'usuario.name as user_name',
        'usuario.email as user_email',
        'slot.data as slot_data',
        'slot.inicio as slot_inicio',
        'slot.fim as slot_fim',
        'slot.recurso as slot_recurso',
      )
      .orderBy('agendamento.created_at', 'desc')

    return rows.map((r: any) => {
      const entity = this.mapToEntity(r)
      ;(entity as any).expand = {
        id_usuario: {
          id: r.id_usuario,
          name: r.user_name,
          email: r.user_email,
        },
        id_slot: {
          id_slot: r.id_slot,
          data: r.slot_data instanceof Date ? r.slot_data.toISOString().split('T')[0] : r.slot_data,
          inicio: r.slot_inicio,
          fim: r.slot_fim,
          recurso: r.slot_recurso,
        },
      }
      return entity
    })
  }

  async findExistente(id_slot: string, id_usuario: string): Promise<AgendamentoEntity | null> {
    const row = await this.knex('agendamento').where({ id_slot, id_usuario }).first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async create(agendamento: Partial<AgendamentoEntity>, trx?: any): Promise<AgendamentoEntity> {
    const id_agendamento = agendamento.id_agendamento || uuidv4()
    const dataToInsert = {
      id_agendamento,
      id_slot: agendamento.id_slot,
      id_usuario: agendamento.id_usuario,
      id_organizacao: agendamento.id_organizacao,
      status: agendamento.status || 'agendado',
      observacao: agendamento.observacao || null,
      created_at: new Date(),
      update_at: new Date(),
    }

    const [inserted] = await this.getQuery(trx).insert(dataToInsert).returning('*')
    return this.mapToEntity(inserted || dataToInsert)
  }

  async updateStatus(
    id: string,
    status: AgendamentoEntity['status'],
    trx?: any,
  ): Promise<AgendamentoEntity> {
    const [updated] = await this.getQuery(trx)
      .where({ id_agendamento: id })
      .update({
        status,
        update_at: new Date(),
      })
      .returning('*')

    if (!updated) {
      const current = await this.findById(id, trx)
      if (!current) throw new Error('Agendamento não encontrado para atualizar status.')
      return current
    }
    return this.mapToEntity(updated)
  }

  async countPorPeriodo(options: {
    id_usuario: string
    id_organizacao: string
    data: string // YYYY-MM-DD
  }): Promise<{ dia: number; semana: number; mes: number }> {
    const { id_usuario, id_organizacao, data } = options

    // Calcular limites temporais a partir da data de agendamento alvo
    const dataAlvo = new Date(data)
    const ano = dataAlvo.getUTCFullYear()
    const mesIdx = dataAlvo.getUTCMonth()

    // Início e fim do mês
    const inicioMes = new Date(Date.UTC(ano, mesIdx, 1)).toISOString().split('T')[0]
    const fimMes = new Date(Date.UTC(ano, mesIdx + 1, 0)).toISOString().split('T')[0]

    // Início e fim da semana (domingo a sábado)
    const diaSemana = dataAlvo.getUTCDay()
    const inicioSemanaDate = new Date(dataAlvo)
    inicioSemanaDate.setUTCDate(dataAlvo.getUTCDate() - diaSemana)
    const fimSemanaDate = new Date(inicioSemanaDate)
    fimSemanaDate.setUTCDate(inicioSemanaDate.getUTCDate() + 6)

    const inicioSemana = inicioSemanaDate.toISOString().split('T')[0]
    const fimSemana = fimSemanaDate.toISOString().split('T')[0]

    const baseQuery = () =>
      this.knex('agendamento')
        .join('slot', 'agendamento.id_slot', 'slot.id_slot')
        .where('agendamento.id_usuario', id_usuario)
        .where('agendamento.id_organizacao', id_organizacao)
        .where('agendamento.status', 'agendado')

    const [diaCount] = await baseQuery().whereRaw('slot.data::text = ?', [data]).count('* as c')
    const [semanaCount] = await baseQuery()
      .whereBetween('slot.data', [inicioSemana, fimSemana])
      .count('* as c')
    const [mesCount] = await baseQuery()
      .whereBetween('slot.data', [inicioMes, fimMes])
      .count('* as c')

    return {
      dia: Number(diaCount?.c || 0),
      semana: Number(semanaCount?.c || 0),
      mes: Number(mesCount?.c || 0),
    }
  }

  private mapToEntity(row: any): AgendamentoEntity {
    return {
      id_agendamento: row.id_agendamento,
      id_slot: row.id_slot,
      id_usuario: row.id_usuario,
      id_organizacao: row.id_organizacao,
      status: row.status,
      observacao: row.observacao,
      created_at: row.created_at,
      update_at: row.update_at,
    }
  }
}
