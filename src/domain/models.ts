// Domain Models (Entidades e Contratos de Domínio)

export type UserRole = 'admin' | 'gestor' | 'profissional' | 'usuario'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  emailVerified?: boolean
  created: string
  updated: string
}

export interface Acesso {
  id: string
  id_usuario: string
  perfis: UserRole[]
  created?: string
  updated?: string
}

export interface Organizacao {
  id: string
  codigo: string
  nome: string
  descricao?: string
  telefone?: string
  endereco?: string
  created?: string
  updated?: string
}

export interface AcessoEOrganizacao {
  id: string
  id_usuario: string
  id_acesso?: string
  id_organizacao: string
  papel?: 'admin' | 'profissional' | 'membro'
  assigned_at?: string
  expand?: {
    id_usuario?: User
    id_organizacao?: Organizacao
  }
}

export interface Slot {
  id: string
  id_organizacao: string
  id_profissional?: string
  data: string // YYYY-MM-DD
  inicio: string // HH:mm
  fim: string // HH:mm
  recurso: string // ex: "Sala 1", "Musculação", "Studio Pilates"
  quantidade: number // Capacidade total de vagas
  quantidade_utilizada: number // Vagas já ocupadas
  ativo?: boolean
  created?: string
  updated?: string
  expand?: {
    id_organizacao?: Organizacao
    id_profissional?: User
  }
}

export type AgendamentoStatus = 'agendado' | 'cancelado' | 'concluido' | 'falta'

export interface Agendamento {
  id: string
  id_slot: string
  id_usuario: string
  id_organizacao: string
  status: AgendamentoStatus
  observacao?: string
  created?: string
  updated?: string
  expand?: {
    id_slot?: Slot
    id_usuario?: User
    id_organizacao?: Organizacao
  }
}

export interface Contrato {
  id: string
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
  created?: string
  updated?: string
  expand?: {
    id_usuario?: User
    id_organizacao?: Organizacao
  }
}
