import pb from '@/lib/pocketbase/client'
import { Contrato } from '@/domain/models'

export interface CreateContratoInput {
  id_usuario: string
  id_organizacao: string
  ativo: boolean
  data_inicio: string
  data_fim: string
  slots_por_dia?: number
  slots_por_semana?: number
  slots_por_mes?: number
  saldo_slots: number
  plano_nome?: string
}

export const contratoService = {
  async getByUsuario(id_usuario: string): Promise<Contrato[]> {
    return await pb.collection('contrato').getFullList<Contrato>({
      filter: `id_usuario = "${id_usuario}"`,
      sort: '-created',
      expand: 'id_usuario,id_organizacao',
    })
  },

  async getByUsuarioAndOrg(id_usuario: string, id_organizacao: string): Promise<Contrato | null> {
    try {
      return await pb
        .collection('contrato')
        .getFirstListItem<Contrato>(
          `id_usuario = "${id_usuario}" && id_organizacao = "${id_organizacao}" && ativo = true`,
        )
    } catch {
      return null
    }
  },

  async getAll(): Promise<Contrato[]> {
    return await pb.collection('contrato').getFullList<Contrato>({
      sort: '-created',
      expand: 'id_usuario,id_organizacao',
    })
  },

  async create(data: CreateContratoInput): Promise<Contrato> {
    return await pb.collection('contrato').create<Contrato>(data)
  },

  async update(id: string, data: Partial<CreateContratoInput>): Promise<Contrato> {
    return await pb.collection('contrato').update<Contrato>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return await pb.collection('contrato').delete(id)
  },
}
