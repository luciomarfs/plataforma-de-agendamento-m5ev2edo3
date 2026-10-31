import { User, Organizacao, Slot, Agendamento, Contrato } from '../types/api'

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
}

// -------------------------------------------------------------
// 3. SLOTS / AGENDA CONTROLLER (/api/slots)
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
}

// -------------------------------------------------------------
// 4. AGENDAMENTOS CONTROLLER (/api/agendamentos)
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

  obter: (id: string) => apiRequest<Agendamento>(`/agendamentos/${id}`),

  atualizar: (id: string, dados: { observacao?: string; status?: string }) =>
    apiRequest<Agendamento>(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),
}

// -------------------------------------------------------------
// 5. CONTRATOS CONTROLLER (/api/contratos)
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
}
