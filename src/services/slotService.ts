import pb from '@/lib/pocketbase/client'
import { Slot } from '@/domain/models'

export interface CreateSlotInput {
  id_organizacao: string
  id_profissional?: string
  data: string // YYYY-MM-DD
  inicio: string // HH:mm
  fim: string // HH:mm
  recurso: string
  quantidade: number
  quantidade_utilizada?: number
  ativo?: boolean
}

export interface BatchCreateSlotInput {
  id_organizacao: string
  id_profissional?: string
  datas: string[] // datas a gerar
  horarios: { inicio: string; fim: string }[]
  recurso: string
  quantidade: number
}

export const slotService = {
  async getByOrganizacao(id_organizacao: string, data?: string): Promise<Slot[]> {
    let filter = `id_organizacao = "${id_organizacao}"`
    if (data) {
      filter += ` && data = "${data}"`
    }
    return await pb.collection('slot').getFullList<Slot>({
      filter,
      sort: 'data,inicio',
      expand: 'id_organizacao,id_profissional',
    })
  },

  async getAllAvailable(id_organizacao?: string, data?: string): Promise<Slot[]> {
    const filters: string[] = ['ativo = true']
    if (id_organizacao) filters.push(`id_organizacao = "${id_organizacao}"`)
    if (data) filters.push(`data = "${data}"`)

    const filter = filters.join(' && ')
    return await pb.collection('slot').getFullList<Slot>({
      filter,
      sort: 'data,inicio',
      expand: 'id_organizacao,id_profissional',
    })
  },

  async getById(id: string): Promise<Slot> {
    return await pb.collection('slot').getOne<Slot>(id, {
      expand: 'id_organizacao,id_profissional',
    })
  },

  async create(data: CreateSlotInput): Promise<Slot> {
    return await pb.collection('slot').create<Slot>({
      ...data,
      quantidade_utilizada: data.quantidade_utilizada ?? 0,
      ativo: data.ativo ?? true,
    })
  },

  async createBatch(input: BatchCreateSlotInput): Promise<Slot[]> {
    const createdSlots: Slot[] = []
    for (const data of input.datas) {
      for (const h of input.horarios) {
        const slot = await pb.collection('slot').create<Slot>({
          id_organizacao: input.id_organizacao,
          id_profissional: input.id_profissional || null,
          data,
          inicio: h.inicio,
          fim: h.fim,
          recurso: input.recurso,
          quantidade: input.quantidade,
          quantidade_utilizada: 0,
          ativo: true,
        })
        createdSlots.push(slot)
      }
    }
    return createdSlots
  },

  async update(id: string, data: Partial<CreateSlotInput>): Promise<Slot> {
    return await pb.collection('slot').update<Slot>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return await pb.collection('slot').delete(id)
  },
}
