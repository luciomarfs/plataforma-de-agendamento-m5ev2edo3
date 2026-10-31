import type { Knex } from 'knex'
import { AcessoEntity, PerfilAcesso } from '../../../domain/entities.js'
import { IAcessoRepository } from '../../../domain/repositories/interfaces.js'

export class KnexAcessoRepository implements IAcessoRepository {
  constructor(private knex: Knex) {}

  async findByUsuarioId(id_usuario: string): Promise<AcessoEntity | null> {
    const row = await this.knex('acesso').where({ id_usuario }).first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async saveOrUpdate(id_usuario: string, perfis: string[]): Promise<AcessoEntity> {
    const perfisPostgres = Array.isArray(perfis) ? perfis : [perfis]
    const exists = await this.knex('acesso').where({ id_usuario }).first()

    if (exists) {
      const [updated] = await this.knex('acesso')
        .where({ id_usuario })
        .update({
          perfis: this.knex.raw('?::text[]', [perfisPostgres]),
          update_at: new Date(),
        })
        .returning('*')
      return this.mapToEntity(updated || { id_usuario, perfis: perfisPostgres })
    } else {
      const [inserted] = await this.knex('acesso')
        .insert({
          id_usuario,
          perfis: this.knex.raw('?::text[]', [perfisPostgres]),
          created_at: new Date(),
          update_at: new Date(),
        })
        .returning('*')
      return this.mapToEntity(inserted || { id_usuario, perfis: perfisPostgres })
    }
  }

  async listAll(): Promise<AcessoEntity[]> {
    const rows = await this.knex('acesso').select('*')
    return rows.map((r: any) => this.mapToEntity(r))
  }

  private mapToEntity(row: any): AcessoEntity {
    let perfis: PerfilAcesso[] = []
    if (Array.isArray(row.perfis)) {
      perfis = row.perfis
    } else if (typeof row.perfis === 'string') {
      // Postgres array string format '{admin,gestor}'
      perfis = row.perfis
        .replace(/[{}]/g, '')
        .split(',')
        .map((p: string) => p.trim())
        .filter(Boolean) as PerfilAcesso[]
    }
    return {
      id_usuario: row.id_usuario,
      perfis,
      created_at: row.created_at,
      update_at: row.update_at,
    }
  }
}
