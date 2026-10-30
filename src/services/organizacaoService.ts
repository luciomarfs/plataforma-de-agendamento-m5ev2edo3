import pb from '@/lib/pocketbase/client'
import { Organizacao } from '@/domain/models'

export interface CreateOrganizacaoInput {
  codigo: string
  nome: string
  descricao?: string
  telefone?: string
  endereco?: string
}

export const organizacaoService = {
  async getAll(): Promise<Organizacao[]> {
    return await pb.collection('organizacao').getFullList<Organizacao>({
      sort: 'nome',
    })
  },

  async getById(id: string): Promise<Organizacao> {
    return await pb.collection('organizacao').getOne<Organizacao>(id)
  },

  async getByCodigo(codigo: string): Promise<Organizacao | null> {
    try {
      return await pb
        .collection('organizacao')
        .getFirstListItem<Organizacao>(`codigo = "${codigo}"`)
    } catch {
      return null
    }
  },

  async create(data: CreateOrganizacaoInput): Promise<Organizacao> {
    return await pb.collection('organizacao').create<Organizacao>(data)
  },

  async update(id: string, data: Partial<CreateOrganizacaoInput>): Promise<Organizacao> {
    return await pb.collection('organizacao').update<Organizacao>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return await pb.collection('organizacao').delete(id)
  },
}
