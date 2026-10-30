import pb from '@/lib/pocketbase/client'
import {
  Organizacao,
  Slot,
  Agendamento,
  Contrato,
  AcessoEOrganizacao,
  User,
  Acesso,
} from '@/types/schema'

// ================= ORGANIZAÇÕES =================
export const getOrganizacoes = async () => {
  return pb.collection('organizacao').getFullList<Organizacao>({
    sort: 'nome',
  })
}

export const getOrganizacaoById = async (id: string) => {
  return pb.collection('organizacao').getOne<Organizacao>(id)
}

export const createOrganizacao = async (data: Partial<Organizacao>) => {
  return pb.collection('organizacao').create<Organizacao>(data)
}

export const updateOrganizacao = async (id: string, data: Partial<Organizacao>) => {
  return pb.collection('organizacao').update<Organizacao>(id, data)
}

export const deleteOrganizacao = async (id: string) => {
  return pb.collection('organizacao').delete(id)
}

// ================= PROFISSIONAIS & USUÁRIOS =================
export const getUsuarios = async () => {
  return pb.collection('users').getFullList<User>({
    sort: 'name',
  })
}

export const getProfissionais = async () => {
  // Profissionais podem ser identificados pela tabela acesso ou acessoeorganizacao
  try {
    const acessos = await pb.collection('acesso').getFullList<Acesso>()
    const profUserIds = acessos
      .filter((a) => {
        const raw = a.perfis as unknown
        let p: string[] = []
        if (Array.isArray(raw)) {
          p = raw
        } else if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw)
            p = Array.isArray(parsed) ? parsed : [raw]
          } catch {
            p = [raw]
          }
        }
        return (
          Array.isArray(p) &&
          (p.includes('profissional') || p.includes('admin') || p.includes('gestor'))
        )
      })
      .map((a) => a.id_usuario)

    if (profUserIds.length === 0) {
      return pb.collection('users').getFullList<User>({ sort: 'name' })
    }

    const filter = profUserIds.map((id) => `id = "${id}"`).join(' || ')
    return pb.collection('users').getFullList<User>({
      filter,
      sort: 'name',
    })
  } catch {
    return pb.collection('users').getFullList<User>({ sort: 'name' })
  }
}

export const getAcessosEOrganizacoes = async (orgId?: string) => {
  return pb.collection('acessoeorganizacao').getFullList<AcessoEOrganizacao>({
    filter: orgId ? `id_organizacao = "${orgId}"` : '',
    expand: 'id_usuario,id_organizacao',
    sort: '-created',
  })
}

export const vincularProfissionalOrg = async (data: {
  id_usuario: string
  id_organizacao: string
  papel: string
}) => {
  return pb.collection('acessoeorganizacao').create<AcessoEOrganizacao>({
    ...data,
    assigned_at: new Date().toISOString(),
  })
}

export const removerVinculoOrg = async (id: string) => {
  return pb.collection('acessoeorganizacao').delete(id)
}

export const updateUsuarioPerfil = async (userId: string, perfis: string[]) => {
  const existing = await pb.collection('acesso').getList<Acesso>(1, 1, {
    filter: `id_usuario = "${userId}"`,
  })
  if (existing.items.length > 0) {
    return pb.collection('acesso').update(existing.items[0].id, {
      perfis,
    })
  } else {
    return pb.collection('acesso').create({
      id_usuario: userId,
      perfis,
    })
  }
}

// ================= SLOTS / AGENDA =================
export const getSlots = async (options?: {
  organizacaoId?: string
  data?: string
  apenasAtivos?: boolean
}) => {
  const filters: string[] = []
  if (options?.organizacaoId) {
    filters.push(`id_organizacao = "${options.organizacaoId}"`)
  }
  if (options?.data) {
    filters.push(`data = "${options.data}"`)
  }
  if (options?.apenasAtivos !== false) {
    filters.push(`ativo = true`)
  }

  return pb.collection('slot').getFullList<Slot>({
    filter: filters.length > 0 ? filters.join(' && ') : '',
    expand: 'id_organizacao,id_profissional',
    sort: 'data,inicio',
  })
}

export const createSlot = async (data: {
  id_organizacao: string
  id_profissional?: string
  data: string
  inicio: string
  fim: string
  recurso: string
  quantidade: number
  quantidade_utilizada?: number
  ativo?: boolean
}) => {
  return pb.collection('slot').create<Slot>({
    ...data,
    quantidade_utilizada: data.quantidade_utilizada ?? 0,
    ativo: data.ativo ?? true,
  })
}

export const updateSlot = async (id: string, data: Partial<Slot>) => {
  return pb.collection('slot').update<Slot>(id, data)
}

export const deleteSlot = async (id: string) => {
  return pb.collection('slot').delete(id)
}

// ================= CONTRATOS =================
export const getContratos = async (userId?: string, orgId?: string) => {
  const filters: string[] = []
  if (userId) filters.push(`id_usuario = "${userId}"`)
  if (orgId) filters.push(`id_organizacao = "${orgId}"`)

  return pb.collection('contrato').getFullList<Contrato>({
    filter: filters.join(' && '),
    expand: 'id_usuario,id_organizacao',
    sort: '-created',
  })
}

export const createContrato = async (data: Partial<Contrato>) => {
  return pb.collection('contrato').create<Contrato>({
    ativo: true,
    saldo_slots: 10,
    slots_por_dia: 2,
    slots_por_semana: 4,
    slots_por_mes: 16,
    ...data,
  })
}

export const updateContrato = async (id: string, data: Partial<Contrato>) => {
  return pb.collection('contrato').update<Contrato>(id, data)
}

export const deleteContrato = async (id: string) => {
  return pb.collection('contrato').delete(id)
}

// ================= AGENDAMENTOS =================
export const getAgendamentosDoUsuario = async (userId: string) => {
  return pb.collection('agendamento').getFullList<Agendamento>({
    filter: `id_usuario = "${userId}"`,
    expand: 'id_slot,id_slot.id_profissional,id_organizacao',
    sort: '-created',
  })
}

export const getTodosAgendamentos = async (orgId?: string) => {
  return pb.collection('agendamento').getFullList<Agendamento>({
    filter: orgId ? `id_organizacao = "${orgId}"` : '',
    expand: 'id_slot,id_slot.id_profissional,id_usuario,id_organizacao',
    sort: '-created',
  })
}

export const realizarAgendamento = async ({
  slotId,
  userId,
  organizacaoId,
  observacao,
}: {
  slotId: string
  userId: string
  organizacaoId: string
  observacao?: string
}) => {
  // 1. Obter slot atualizado
  const slot = await pb.collection('slot').getOne<Slot>(slotId)

  // 2. Checar capacidade da sessão
  const ocupadas = slot.quantidade_utilizada || 0
  if (ocupadas >= slot.quantidade) {
    throw new Error('Capacidade esgotada para este horário! Não há vagas disponíveis.')
  }

  // 3. Checar se usuário já possui agendamento ativo neste slot
  const jaAgendado = await pb.collection('agendamento').getList<Agendamento>(1, 1, {
    filter: `id_slot = "${slotId}" && id_usuario = "${userId}" && status = "agendado"`,
  })
  if (jaAgendado.items.length > 0) {
    throw new Error('Você já possui um agendamento confirmado para este horário.')
  }

  // 4. Checar contrato se existir
  const contratos = await pb.collection('contrato').getList<Contrato>(1, 1, {
    filter: `id_usuario = "${userId}" && id_organizacao = "${organizacaoId}" && ativo = true`,
  })

  let contratoAtivo: Contrato | null = null
  if (contractsAvailable(contratos.items)) {
    contratoAtivo = contratos.items[0]
    if (contratoAtivo.saldo_slots !== undefined && contratoAtivo.saldo_slots <= 0) {
      throw new Error('Saldo de slots do seu contrato está zerado.')
    }
  }

  // 5. Criar registro de agendamento
  const novoAgendamento = await pb.collection('agendamento').create<Agendamento>({
    id_slot: slotId,
    id_usuario: userId,
    id_organizacao: organizacaoId,
    status: 'agendado',
    observacao: observacao || '',
  })

  // 6. Atualizar quantidade_utilizada do slot
  await pb.collection('slot').update(slotId, {
    quantidade_utilizada: ocupadas + 1,
  })

  // 7. Deduzir saldo de slots no contrato se houver
  if (contratoAtivo && contratoAtivo.saldo_slots !== undefined) {
    await pb.collection('contrato').update(contratoAtivo.id, {
      saldo_slots: Math.max(0, contratoAtivo.saldo_slots - 1),
    })
  }

  return novoAgendamento
}

export const cancelarAgendamento = async (agendamentoId: string) => {
  const agendamento = await pb.collection('agendamento').getOne<Agendamento>(agendamentoId, {
    expand: 'id_slot',
  })

  if (agendamento.status === 'cancelado') {
    return agendamento
  }

  // 1. Atualizar status para cancelado
  const updated = await pb.collection('agendamento').update<Agendamento>(agendamentoId, {
    status: 'cancelado',
  })

  // 2. Liberar vaga no slot
  if (agendamento.id_slot) {
    try {
      const slot = await pb.collection('slot').getOne<Slot>(agendamento.id_slot)
      const novaQtd = Math.max(0, (slot.quantidade_utilizada || 1) - 1)
      await pb.collection('slot').update(agendamento.id_slot, {
        quantidade_utilizada: novaQtd,
      })
    } catch (e) {
      console.warn('Erro ao atualizar quantidade do slot:', e)
    }
  }

  // 3. Devolver saldo no contrato se existir
  try {
    const contratos = await pb.collection('contrato').getList<Contrato>(1, 1, {
      filter: `id_usuario = "${agendamento.id_usuario}" && id_organizacao = "${agendamento.id_organizacao}" && ativo = true`,
    })
    if (contractsAvailable(contratos.items)) {
      const c = contratos.items[0]
      if (c.saldo_slots !== undefined) {
        await pb.collection('contrato').update(c.id, {
          saldo_slots: c.saldo_slots + 1,
        })
      }
    }
  } catch (e) {
    console.warn('Erro ao estornar saldo do contrato:', e)
  }

  return updated
}

function contractsAvailable(items: Contrato[]): boolean {
  return items.length > 0 && items[0].ativo === true
}
