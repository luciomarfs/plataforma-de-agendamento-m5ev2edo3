import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { ContratoEntity } from '../../../domain/entities.js'
import { IContratoRepository } from '../../../domain/repositories/interfaces.js'

export class KnexContratoRepository implements IContratoRepository {
  constructor(private knex: Knex) {}

  private getQuery(trx?: any): Knex.QueryBuilder {
    return trx ? trx('contrato') : this.knex('contrato')
  }

  async findById(id: string, trx?: any): Promise<ContratoEntity | null> {
    const query = this.getQuery(trx).where({ id_contrato: id })
    if (trx) {
      query.forUpdate()
    }
    const row = await query.first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async findAtivo(
    id_usuario: string,
    id_organizacao: string,
    trx?: any,
  ): Promise<ContratoEntity | null> {
    const hoje = new Date().toISOString().split('T')[0]
    const query = this.getQuery(trx)
      .where({ id_usuario, id_organizacao, ativo: true })
      .where('data_inicio', '<=', hoje)
      .where('data_fim', '>=', hoje)

    if (trx) {
      query.forUpdate()
    }

    const row = await query.first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async list(options?: {
    id_usuario?: string
    id_organizacao?: string
  }): Promise<ContratoEntity[]> {
    let query = this.knex('contrato')
      .leftJoin('usuario', 'contrato.id_usuario', 'usuario.id')
      .leftJoin('organizacao', 'contrato.id_organizacao', 'organizacao.id_organizacao')
      .select(
        'contrato.*',
        'usuario.name as user_name',
        'usuario.email as user_email',
        'organizacao.nome as org_nome',
      )

    if (options?.id_usuario) {
      query = query.where({ 'contrato.id_usuario': options.id_usuario })
    }
    if (options?.id_organizacao) {
      query = query.where({ 'contrato.id_organizacao': options.id_organizacao })
    }

    const rows = await query.orderBy('contrato.created_at', 'desc')
    return rows.map((r: any) => {
      const entity = this.mapToEntity(r)
      ;(entity as any).expand = {
        id_usuario: { id: r.id_usuario, name: r.user_name, email: r.user_email },
        id_organizacao: { id_organizacao: r.id_organizacao, nome: r.org_nome },
      }
      return entity
    })
  }

  async create(contrato: Partial<ContratoEntity>): Promise<ContratoEntity> {
    const id_contrato = contrato.id_contrato || uuidv4()
    const dataToInsert = {
      id_contrato,
      id_usuario: contrato.id_usuario,
      id_organizacao: contrato.id_organizacao,
      ativo: contrato.ativo !== undefined ? contrato.ativo : true,
      data_inicio: contrato.data_inicio,
      data_fim: contrato.data_fim,
      slots_por_dia: contrato.slots_por_dia !== undefined ? contrato.slots_por_dia : null,
      slots_por_semana: contrato.slots_por_semana !== undefined ? contrato.slots_por_semana : null,
      slots_por_mes: contrato.slots_por_mes !== undefined ? contrato.slots_por_mes : null,
      saldo_slots: contrato.saldo_slots !== undefined ? Number(contrato.saldo_slots) : 10,
      plano_nome: contrato.plano_nome || 'Plano Padrão',
      created_at: new Date(),
      update_at: new Date(),
    }

    const [inserted] = await this.knex('contrato').insert(dataToInsert).returning('*')
    return this.mapToEntity(inserted || dataToInsert)
  }

  async update(id: string, contrato: Partial<ContratoEntity>, trx?: any): Promise<ContratoEntity> {
    const dataToUpdate: any = {
      ...contrato,
      update_at: new Date(),
    }
    delete dataToUpdate.id_contrato

    const [updated] = await this.getQuery(trx)
      .where({ id_contrato: id })
      .update(dataToUpdate)
      .returning('*')

    if (!updated) {
      const current = await this.findById(id, trx)
      if (!current) throw new Error('Contrato não encontrado para atualização.')
      return current
    }
    return this.mapToEntity(updated)
  }

  async delete(id: string): Promise<void> {
    await this.knex('contrato').where({ id_contrato: id }).del()
  }

  async debitarSlot(id_contrato: string, trx?: any): Promise<ContratoEntity> {
    const [updated] = await this.getQuery(trx)
      .where({ id_contrato })
      .where('saldo_slots', '>', 0)
      .decrement('saldo_slots', 1)
      .returning('*')

    if (!updated) {
      throw new Error(`Contrato ${id_contrato} não encontrado ou sem saldo suficiente para débito.`)
    }
    return this.mapToEntity(updated)
  }

  async estornarSlot(id_contrato: string, trx?: any): Promise<ContratoEntity> {
    const [updated] = await this.getQuery(trx)
      .where({ id_contrato })
      .increment('saldo_slots', 1)
      .returning('*')

    if (!updated) {
      const current = await this.findById(id_contrato, trx)
      if (current) return current
      throw new Error(`Contrato ${id_contrato} não encontrado para estorno.`)
    }
    return this.mapToEntity(updated)
  }

  private mapToEntity(row: any): ContratoEntity {
    let dataInicio = row.data_inicio
    if (row.data_inicio instanceof Date) {
      dataInicio = row.data_inicio.toISOString().split('T')[0]
    } else if (typeof row.data_inicio === 'string' && row.data_inicio.includes('T')) {
      dataInicio = row.data_inicio.split('T')[0]
    }

    let dataFim = row.data_fim
    if (row.data_fim instanceof Date) {
      dataFim = row.data_fim.toISOString().split('T')[0]
    } else if (typeof row.data_fim === 'string' && row.data_fim.includes('T')) {
      dataFim = row.data_fim.split('T')[0]
    }

    return {
      id_contrato: row.id_contrato,
      id_usuario: row.id_usuario,
      id_organizacao: row.id_organizacao,
      ativo: Boolean(row.ativo),
      data_inicio: dataInicio,
      data_fim: dataFim,
      slots_por_dia: row.slots_por_dia !== null ? Number(row.slots_por_dia) : null,
      slots_por_semana: row.slots_por_semana !== null ? Number(row.slots_por_semana) : null,
      slots_por_mes: row.slots_por_mes !== null ? Number(row.slots_por_mes) : null,
      saldo_slots: Number(row.saldo_slots),
      plano_nome: row.plano_nome,
    }
  }
}
