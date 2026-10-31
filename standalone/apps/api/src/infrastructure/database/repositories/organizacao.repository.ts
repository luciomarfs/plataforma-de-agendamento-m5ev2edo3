import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { OrganizacaoEntity } from '../../../domain/entities.js'
import { IOrganizacaoRepository } from '../../../domain/repositories/interfaces.js'

export class KnexOrganizacaoRepository implements IOrganizacaoRepository {
  constructor(private knex: Knex) {}

  async findById(id: string): Promise<OrganizacaoEntity | null> {
    const row = await this.knex('organizacao').where({ id_organizacao: id }).first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async findByCodigo(codigo: string): Promise<OrganizacaoEntity | null> {
    const row = await this.knex('organizacao').where({ codigo }).first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async listAll(): Promise<OrganizacaoEntity[]> {
    const rows = await this.knex('organizacao').select('*').orderBy('nome', 'asc')
    return rows.map((r: any) => this.mapToEntity(r))
  }

  async create(org: Partial<OrganizacaoEntity>): Promise<OrganizacaoEntity> {
    const id_organizacao = org.id_organizacao || uuidv4()
    const dataToInsert = {
      id_organizacao,
      codigo: org.codigo?.trim() || `ORG-${Date.now().toString(36).toUpperCase()}`,
      nome: org.nome?.trim() || '',
      descricao: org.descricao || null,
      telefone: org.telefone || null,
      endereco: org.endereco || null,
      created_at: new Date(),
      update_at: new Date(),
    }

    const [inserted] = await this.knex('organizacao').insert(dataToInsert).returning('*')
    return this.mapToEntity(inserted || dataToInsert)
  }

  async update(id: string, org: Partial<OrganizacaoEntity>): Promise<OrganizacaoEntity> {
    const dataToUpdate: any = {
      ...org,
      update_at: new Date(),
    }
    delete dataToUpdate.id_organizacao

    const [updated] = await this.knex('organizacao')
      .where({ id_organizacao: id })
      .update(dataToUpdate)
      .returning('*')

    if (!updated) {
      const current = await this.findById(id)
      if (!current) throw new Error('Organização não encontrada para atualização.')
      return current
    }
    return this.mapToEntity(updated)
  }

  async delete(id: string): Promise<void> {
    await this.knex('organizacao').where({ id_organizacao: id }).del()
  }

  private mapToEntity(row: any): OrganizacaoEntity {
    return {
      id_organizacao: row.id_organizacao,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      telefone: row.telefone,
      endereco: row.endereco,
    }
  }
}
