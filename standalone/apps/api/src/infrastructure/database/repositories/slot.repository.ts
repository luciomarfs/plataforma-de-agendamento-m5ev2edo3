import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { SlotEntity } from '../../../domain/entities.js'
import { ISlotRepository } from '../../../domain/repositories/interfaces.js'

export class KnexSlotRepository implements ISlotRepository {
  constructor(private knex: Knex) {}

  private getQuery(trx?: any): Knex.QueryBuilder {
    return trx ? trx('slot') : this.knex('slot')
  }

  async findById(id: string, trx?: any): Promise<SlotEntity | null> {
    const query = this.getQuery(trx).where({ id_slot: id })
    if (trx) {
      // Adiciona lock de linha no Postgres quando dentro de transação
      query.forUpdate()
    }
    const row = await query.first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async list(options?: {
    organizacaoId?: string
    data?: string
    apenasAtivos?: boolean
  }): Promise<SlotEntity[]> {
    let query = this.knex('slot').select('*')

    if (options?.organizacaoId) {
      query = query.where({ id_organizacao: options.organizacaoId })
    }
    if (options?.data) {
      query = query.whereRaw('data::text = ?', [options.data])
    }
    if (options?.apenasAtivos !== false) {
      query = query.where({ ativo: true })
    }

    const rows = await query.orderBy('data', 'asc').orderBy('inicio', 'asc')
    return rows.map((r: any) => this.mapToEntity(r))
  }

  async create(slot: Partial<SlotEntity>): Promise<SlotEntity> {
    const id_slot = slot.id_slot || uuidv4()
    const dataToInsert = {
      id_slot,
      id_organizacao: slot.id_organizacao,
      id_profissional: slot.id_profissional || null,
      data: slot.data,
      inicio: slot.inicio,
      fim: slot.fim,
      recurso: slot.recurso || 'Geral',
      quantidade: slot.quantidade !== undefined ? Number(slot.quantidade) : 1,
      quantidade_utilizada:
        slot.quantidade_utilizada !== undefined ? Number(slot.quantidade_utilizada) : 0,
      ativo: slot.ativo !== undefined ? slot.ativo : true,
      created_at: new Date(),
      update_at: new Date(),
    }

    const [inserted] = await this.knex('slot').insert(dataToInsert).returning('*')
    return this.mapToEntity(inserted || dataToInsert)
  }

  async update(id: string, slot: Partial<SlotEntity>, trx?: any): Promise<SlotEntity> {
    const dataToUpdate: any = {
      ...slot,
      update_at: new Date(),
    }
    delete dataToUpdate.id_slot

    const [updated] = await this.getQuery(trx)
      .where({ id_slot: id })
      .update(dataToUpdate)
      .returning('*')

    if (!updated) {
      const current = await this.findById(id, trx)
      if (!current) throw new Error('Slot não encontrado para atualização.')
      return current
    }
    return this.mapToEntity(updated)
  }

  async delete(id: string): Promise<void> {
    await this.knex('slot').where({ id_slot: id }).del()
  }

  async incrementarOcupacao(id_slot: string, trx?: any): Promise<SlotEntity> {
    const [updated] = await this.getQuery(trx)
      .where({ id_slot })
      .increment('quantidade_utilizada', 1)
      .returning('*')

    if (!updated) {
      throw new Error(`Slot ${id_slot} não encontrado para incremento de ocupação.`)
    }
    return this.mapToEntity(updated)
  }

  async decrementarOcupacao(id_slot: string, trx?: any): Promise<SlotEntity> {
    // Evita quantidade_utilizada negativa
    const [updated] = await this.getQuery(trx)
      .where({ id_slot })
      .where('quantidade_utilizada', '>', 0)
      .decrement('quantidade_utilizada', 1)
      .returning('*')

    if (!updated) {
      const current = await this.findById(id_slot, trx)
      if (current) return current
      throw new Error(`Slot ${id_slot} não encontrado.`)
    }
    return this.mapToEntity(updated)
  }

  private mapToEntity(row: any): SlotEntity {
    // Tratar data para string YYYY-MM-DD
    let dataStr = row.data
    if (row.data instanceof Date) {
      dataStr = row.data.toISOString().split('T')[0]
    } else if (typeof row.data === 'string' && row.data.includes('T')) {
      dataStr = row.data.split('T')[0]
    }

    return {
      id_slot: row.id_slot,
      id_organizacao: row.id_organizacao,
      id_profissional: row.id_profissional,
      data: dataStr,
      inicio: String(row.inicio).slice(0, 8),
      fim: String(row.fim).slice(0, 8),
      recurso: row.recurso,
      quantidade: Number(row.quantidade),
      quantidade_utilizada: Number(row.quantidade_utilizada),
      ativo: Boolean(row.ativo),
      created_at: row.created_at,
      update_at: row.update_at,
    }
  }
}
