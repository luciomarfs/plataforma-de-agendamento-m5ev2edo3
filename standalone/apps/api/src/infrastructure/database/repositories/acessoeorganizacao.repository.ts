import type { Knex } from 'knex'
import { AcessoEOrganizacaoEntity } from '../../../domain/entities.js'
import { IAcessoEOrganizacaoRepository } from '../../../domain/repositories/interfaces.js'

export class KnexAcessoEOrganizacaoRepository implements IAcessoEOrganizacaoRepository {
  constructor(private knex: Knex) {}

  async findByUserAndOrg(
    id_usuario: string,
    id_organizacao: string,
  ): Promise<AcessoEOrganizacaoEntity | null> {
    const row = await this.knex('acessoeorganizacao').where({ id_usuario, id_organizacao }).first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async listByOrg(id_organizacao: string): Promise<AcessoEOrganizacaoEntity[]> {
    const rows = await this.knex('acessoeorganizacao').where({ id_organizacao }).select('*')
    return rows.map((r: any) => this.mapToEntity(r))
  }

  async listByUser(id_usuario: string): Promise<AcessoEOrganizacaoEntity[]> {
    const rows = await this.knex('acessoeorganizacao').where({ id_usuario }).select('*')
    return rows.map((r: any) => this.mapToEntity(r))
  }

  async create(vinculo: AcessoEOrganizacaoEntity): Promise<AcessoEOrganizacaoEntity> {
    const data = {
      id_usuario: vinculo.id_usuario,
      id_organizacao: vinculo.id_organizacao,
      papel: vinculo.papel || 'profissional',
      assigned_at: vinculo.assigned_at || new Date(),
    }

    const existing = await this.findByUserAndOrg(vinculo.id_usuario, vinculo.id_organizacao)
    if (existing) {
      await this.knex('acessoeorganizacao')
        .where({ id_usuario: vinculo.id_usuario, id_organizacao: vinculo.id_organizacao })
        .update({ papel: data.papel })
      return { ...existing, papel: data.papel }
    }

    const [inserted] = await this.knex('acessoeorganizacao').insert(data).returning('*')
    return this.mapToEntity(inserted || data)
  }

  async delete(id_usuario: string, id_organizacao: string): Promise<void> {
    await this.knex('acessoeorganizacao').where({ id_usuario, id_organizacao }).del()
  }

  private mapToEntity(row: any): AcessoEOrganizacaoEntity {
    return {
      id_usuario: row.id_usuario,
      id_organizacao: row.id_organizacao,
      assigned_at: row.assigned_at,
      papel: row.papel,
    }
  }
}
