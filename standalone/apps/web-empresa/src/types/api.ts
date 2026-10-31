export type PerfilAcesso = 'admin' | 'gestor' | 'profissional' | 'usuario'

export interface User {
  id: string
  name: string
  email: string
  image?: string | null
  perfis: PerfilAcesso[]
}

export interface Organizacao {
  id_organizacao: string
  codigo: string
  nome: string
  descricao?: string | null
  telefone?: string | null
  endereco?: string | null
}

export interface VinculoOrganizacao {
  id_usuario: string
  id_organizacao: string
  papel: 'admin' | 'gestor' | 'profissional' | 'aluno'
  assigned_at?: string
}

export interface Slot {
  id_slot: string
  id_organizacao: string
  id_profissional?: string | null
  data: string // YYYY-MM-DD
  inicio: string // HH:mm:ss
  fim: string // HH:mm:ss
  recurso: string
  quantidade: number
  quantidade_utilizada: number
  ativo?: boolean
}

export type StatusAgendamento = 'agendado' | 'cancelado' | 'concluido' | 'falta'

export interface Agendamento {
  id_agendamento: string
  id_slot: string
  id_usuario: string
  id_organizacao: string
  status: StatusAgendamento
  observacao?: string | null
  created_at?: string
  expand?: {
    id_slot?: Slot
    id_usuario?: Partial<User>
    id_organizacao?: Partial<Organizacao>
  }
}

export interface Contrato {
  id_contrato: string
  id_usuario: string
  id_organizacao: string
  ativo: boolean
  data_inicio: string
  data_fim: string
  slots_por_dia?: number | null
  slots_por_semana?: number | null
  slots_por_mes?: number | null
  saldo_slots: number
  plano_nome?: string | null
  expand?: {
    id_usuario?: Partial<User>
    id_organizacao?: Partial<Organizacao>
  }
}

export interface DashboardMetricas {
  orgsCount: number
  slotsCount: number
  contratosCount: number
}
