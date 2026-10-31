import {
  User,
  Organizacao,
  VinculoOrganizacao,
  Slot,
  Contrato,
  Agendamento,
  DashboardMetricas,
} from '../types/api'

export * from '../types/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Retornos 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Erro HTTP ${res.status}`)
  }

  return data
}

// -------------------------------------------------------------
// 1. AUTH CONTROLLER (/api/auth)
// -------------------------------------------------------------
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; perfis?: string[] }) =>
    apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiRequest<User>('/auth/me'),

  refresh: () => apiRequest<{ token: string; user: User }>('/auth/refresh', { method: 'POST' }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

// -------------------------------------------------------------
// 2. ORGANIZACOES CONTROLLER (/api/organizacoes)
// -------------------------------------------------------------
export const organizacoesApi = {
  listar: () => apiRequest<Organizacao[]>('/organizacoes'),

  obter: (id: string) => apiRequest<Organizacao>(`/organizacoes/${id}`),

  criar: (dados: {
    codigo?: string
    nome: string
    descricao?: string | null
    telefone?: string | null
    endereco?: string | null
  }) =>
    apiRequest<Organizacao>('/organizacoes', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  atualizar: (
    id: string,
    dados: {
      codigo?: string
      nome: string
      descricao?: string | null
      telefone?: string | null
      endereco?: string | null
    },
  ) =>
    apiRequest<Organizacao>(`/organizacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  patch: (id: string, dados: Partial<Organizacao>) =>
    apiRequest<Organizacao>(`/organizacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),

  excluir: (id: string) =>
    apiRequest<void>(`/organizacoes/${id}`, {
      method: 'DELETE',
    }),

  listarVinculos: (id: string) => apiRequest<VinculoOrganizacao[]>(`/organizacoes/${id}/vinculos`),
}

// -------------------------------------------------------------
// 3. PROFISSIONAIS E USUARIOS CONTROLLER (/api/profissionais)
// -------------------------------------------------------------
export const profissionaisApi = {
  listarProfissionais: () => apiRequest<User[]>('/profissionais'),

  listarUsuarios: () => apiRequest<User[]>('/profissionais/usuarios'),

  obter: (id: string) => apiRequest<User>(`/profissionais/${id}`),

  atualizar: (
    id: string,
    dados: {
      name?: string
      email?: string
      image?: string | null
    },
  ) =>
    apiRequest<User>(`/profissionais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  patch: (id: string, dados: Partial<User>) =>
    apiRequest<User>(`/profissionais/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),

  vincular: (dados: {
    id_usuario: string
    id_organizacao: string
    papel?: 'admin' | 'gestor' | 'profissional' | 'aluno'
  }) =>
    apiRequest<VinculoOrganizacao>('/profissionais/vincular', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  desvincular: (id_usuario: string, id_organizacao: string) =>
    apiRequest<void>('/profissionais/desvincular', {
      method: 'DELETE',
      body: JSON.stringify({ id_usuario, id_organizacao }),
    }),

  atualizarPerfis: (id: string, perfis: string[]) =>
    apiRequest<{ id_usuario: string; perfis: string[] }>(`/profissionais/${id}/perfis`, {
      method: 'PATCH',
      body: JSON.stringify({ perfis }),
    }),
}

// -------------------------------------------------------------
// 4. SLOTS / AGENDA CONTROLLER (/api/slots)
// -------------------------------------------------------------
export const slotsApi = {
  listar: (filtros?: { organizacaoId?: string; data?: string; apenasAtivos?: boolean }) => {
    const params = new URLSearchParams()
    if (filtros?.organizacaoId) params.append('organizacaoId', filtros.organizacaoId)
    if (filtros?.data) params.append('data', filtros.data)
    if (filtros?.apenasAtivos !== undefined)
      params.append('apenasAtivos', String(filtros.apenasAtivos))

    const qs = params.toString()
    return apiRequest<Slot[]>(`/slots${qs ? `?${qs}` : ''}`)
  },

  obter: (id: string) => apiRequest<Slot>(`/slots/${id}`),

  criar: (dados: {
    id_organizacao: string
    id_profissional?: string | null
    data: string
    inicio: string
    fim: string
    recurso: string
    quantidade: number
    ativo?: boolean
  }) =>
    apiRequest<Slot>('/slots', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  criarLote: (
    slots: Array<{
      id_organizacao: string
      id_profissional?: string | null
      data: string
      inicio: string
      fim: string
      recurso: string
      quantidade: number
      ativo?: boolean
    }>,
  ) =>
    apiRequest<Slot[]>('/slots/lote', {
      method: 'POST',
      body: JSON.stringify({ slots }),
    }),

  atualizar: (
    id: string,
    dados: {
      id_organizacao?: string
      id_profissional?: string | null
      data?: string
      inicio?: string
      fim?: string
      recurso?: string
      quantidade?: number
      ativo?: boolean
    },
  ) =>
    apiRequest<Slot>(`/slots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  patch: (id: string, dados: Partial<Slot>) =>
    apiRequest<Slot>(`/slots/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),

  excluir: (id: string) =>
    apiRequest<void>(`/slots/${id}`, {
      method: 'DELETE',
    }),
}

// -------------------------------------------------------------
// 5. AGENDAMENTOS CONTROLLER (/api/agendamentos)
// -------------------------------------------------------------
export const agendamentosApi = {
  criar: (dados: {
    id_slot: string
    id_usuario?: string
    id_organizacao?: string
    observacao?: string
  }) =>
    apiRequest<Agendamento>('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  cancelar: (id: string) =>
    apiRequest<{ id_agendamento: string; status: string; estornado: boolean }>(
      `/agendamentos/${id}/cancelar`,
      { method: 'POST' },
    ),

  meus: () => apiRequest<Agendamento[]>('/agendamentos/meus'),

  listarPorOrganizacao: (orgId: string) =>
    apiRequest<Agendamento[]>(`/agendamentos/organizacao/${orgId}`),

  obter: (id: string) => apiRequest<Agendamento>(`/agendamentos/${id}`),

  atualizar: (id: string, dados: { observacao?: string; status?: string }) =>
    apiRequest<Agendamento>(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  patch: (id: string, dados: { observacao?: string; status?: string }) =>
    apiRequest<Agendamento>(`/agendamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),

  excluir: (id: string) =>
    apiRequest<void>(`/agendamentos/${id}`, {
      method: 'DELETE',
    }),
}

// -------------------------------------------------------------
// 6. CONTRATOS CONTROLLER (/api/contratos)
// -------------------------------------------------------------
export const contratosApi = {
  listar: (filtros?: { id_usuario?: string; id_organizacao?: string }) => {
    const params = new URLSearchParams()
    if (filtros?.id_usuario) params.append('id_usuario', filtros.id_usuario)
    if (filtros?.id_organizacao) params.append('id_organizacao', filtros.id_organizacao)
    const qs = params.toString()
    return apiRequest<Contrato[]>(`/contratos${qs ? `?${qs}` : ''}`)
  },

  obter: (id: string) => apiRequest<Contrato>(`/contratos/${id}`),

  criar: (dados: {
    id_usuario: string
    id_organizacao: string
    ativo?: boolean
    data_inicio: string
    data_fim: string
    slots_por_dia?: number | null
    slots_por_semana?: number | null
    slots_por_mes?: number | null
    saldo_slots?: number
    plano_nome?: string
  }) =>
    apiRequest<Contrato>('/contratos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  atualizar: (
    id: string,
    dados: {
      id_usuario?: string
      id_organizacao?: string
      ativo?: boolean
      data_inicio?: string
      data_fim?: string
      slots_por_dia?: number | null
      slots_por_semana?: number | null
      slots_por_mes?: number | null
      saldo_slots?: number
      plano_nome?: string
    },
  ) =>
    apiRequest<Contrato>(`/contratos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  patch: (id: string, dados: Partial<Contrato>) =>
    apiRequest<Contrato>(`/contratos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),

  excluir: (id: string) =>
    apiRequest<void>(`/contratos/${id}`, {
      method: 'DELETE',
    }),
}

// -------------------------------------------------------------
// 7. DASHBOARD CONTROLLER (/api/dashboard)
// -------------------------------------------------------------
export const dashboardApi = {
  metricas: (id_organizacao?: string) => {
    const qs = id_organizacao ? `?id_organizacao=${id_organizacao}` : ''
    return apiRequest<DashboardMetricas>(`/dashboard/metricas${qs}`)
  },

  backlog: (id_organizacao?: string) => {
    const qs = id_organizacao ? `?id_organizacao=${id_organizacao}` : ''
    return apiRequest<Agendamento[]>(`/dashboard/backlog${qs}`)
  },
}
