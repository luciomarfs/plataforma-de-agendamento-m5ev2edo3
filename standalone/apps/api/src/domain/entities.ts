export type PerfilAcesso = 'admin' | 'gestor' | 'profissional' | 'usuario';

export interface UsuarioEntity {
  id: string;
  name: string;
  email: string;
  email_verified?: Date | null;
  image?: string | null;
  password?: string;
  created_at?: Date;
  update_at?: Date;
}

export interface AcessoEntity {
  id_usuario: string;
  perfis: PerfilAcesso[];
  created_at?: Date;
  update_at?: Date;
}

export interface AcessoEOrganizacaoEntity {
  id_usuario: string;
  id_organizacao: string;
  assigned_at?: Date;
  papel?: 'admin' | 'gestor' | 'profissional' | 'aluno';
}

export interface OrganizacaoEntity {
  id_organizacao: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  telefone?: string | null;
  endereco?: string | null;
}

export interface SlotEntity {
  id_slot: string;
  id_organizacao: string;
  id_profissional?: string | null;
  data: string; // YYYY-MM-DD
  inicio: string; // HH:mm ou HH:mm:ss
  fim: string; // HH:mm ou HH:mm:ss
  recurso: string;
  quantidade: number;
  quantidade_utilizada: number;
  ativo?: boolean;
  created_at?: Date;
  update_at?: Date;
}

export type StatusAgendamento = 'agendado' | 'cancelado' | 'concluido' | 'falta';

export interface AgendamentoEntity {
  id_agendamento: string;
  id_slot: string;
  id_usuario: string;
  id_organizacao: string;
  status: StatusAgendamento;
  observacao?: string | null;
  created_at?: Date;
  update_at?: Date;
}

export interface ContratoEntity {
  id_contrato: string;
  id_usuario: string;
  id_organizacao: string;
  ativo: boolean;
  data_inicio: string; // YYYY-MM-DD
  data_fim: string; // YYYY-MM-DD
  slots_por_dia?: number | null;
  slots_por_semana?: number | null;
  slots_por_mes?: number | null;
  saldo_slots: number;
  plano_nome?: string | null;
}
