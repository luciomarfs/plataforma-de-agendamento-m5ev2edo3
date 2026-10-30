export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  verified: boolean
  created: string
  updated: string
}

export interface Acesso {
  id: string
  id_usuario: string
  perfis: string[] // 'admin' | 'gestor' | 'profissional' | 'usuario'
  created: string
  updated: string
}

export interface Organizacao {
  id: string
  codigo: string
  nome: string
  descricao?: string
  telefone?: string
  endereco?: string
  created: string
  updated: string
}

export interface AcessoEOrganizacao {
  id: string
  id_usuario: string
  id_acesso?: string
  id_organizacao: string
  papel?: string // 'admin' | 'gestor' | 'profissional' | 'aluno'
  assigned_at?: string
  created: string
  updated: string
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
  recurso: string // ex: Studio Pilates, Fisioterapia Box 1
  quantidade: number // capacidade total da sessão
  quantidade_utilizada: number // vagas ocupadas
  ativo?: boolean
  created: string
  updated: string
  expand?: {
    id_organizacao?: Organizacao
    id_profissional?: User
  }
}

export type StatusAgendamento = 'agendado' | 'cancelado' | 'concluido' | 'falta'

export interface Agendamento {
  id: string
  id_slot: string
  id_usuario: string
  id_organizacao: string
  status: StatusAgendamento
  observacao?: string
  created: string
  updated: string
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
  saldo_slots?: number
  plano_nome?: string
  created: string
  updated: string
  expand?: {
    id_usuario?: User
    id_organizacao?: Organizacao
  }
}

export interface BacklogItem {
  id: string
  titulo: string
  descricao: string
  prioridade: 'alta' | 'media' | 'baixa'
  status: 'planejado' | 'em_andamento' | 'concluido'
  categoria: string
  estimativa?: string
}
