import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { UsuarioEntity } from '../../../domain/entities.js'
import { IUsuarioRepository } from '../../../domain/repositories/interfaces.js'

export class KnexUsuarioRepository implements IUsuarioRepository {
  constructor(private knex: Knex) {}

  async findById(id: string): Promise<UsuarioEntity | null> {
    const row = await this.knex('usuario').where({ id }).first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    const row = await this.knex('usuario').where({ email: email.toLowerCase() }).first()
    if (!row) return null
    return this.mapToEntity(row)
  }

  async create(usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity> {
    const id = usuario.id || uuidv4()
    const dataToInsert = {
      id,
      name: usuario.name,
      email: usuario.email?.toLowerCase(),
      password: usuario.password,
      image: usuario.image || null,
      email_verified: usuario.email_verified || null,
      created_at: usuario.created_at || new Date(),
      update_at: usuario.update_at || new Date(),
    }

    const [inserted] = await this.knex('usuario').insert(dataToInsert).returning('*')
    return this.mapToEntity(inserted || dataToInsert)
  }

  async update(id: string, usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity> {
    const dataToUpdate: any = {
      ...usuario,
      update_at: new Date(),
    }
    if (dataToUpdate.email) {
      dataToUpdate.email = dataToUpdate.email.toLowerCase()
    }

    const [updated] = await this.knex('usuario').where({ id }).update(dataToUpdate).returning('*')

    if (!updated) {
      const current = await this.findById(id)
      if (!current) throw new Error('Usuário não encontrado para atualização.')
      return current
    }
    return this.mapToEntity(updated)
  }

  async listAll(): Promise<UsuarioEntity[]> {
    const rows = await this.knex('usuario').select('*').orderBy('name', 'asc')
    return rows.map((r: any) => this.mapToEntity(r))
  }

  private mapToEntity(row: any): UsuarioEntity {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      image: row.image,
      email_verified: row.email_verified,
      created_at: row.created_at,
      update_at: row.update_at,
    }
  }
}
