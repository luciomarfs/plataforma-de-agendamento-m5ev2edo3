export const gerarLinkWhatsAppConfirmacao = (params: {
  telefone?: string
  nomeUsuario: string
  nomeOrganizacao: string
  recurso: string
  data: string
  horario: string
  profissionalNome?: string
}) => {
  const telLimpo = (params.telefone || '').replace(/\D/g, '')
  const foneDestino =
    telLimpo.length >= 10 ? (telLimpo.startsWith('55') ? telLimpo : `55${telLimpo}`) : ''

  const texto = encodeURIComponent(
    `Olá! Confirmação de Agendamento:\n\n` +
      `*Aluno(a):* ${params.nomeUsuario}\n` +
      `*Local:* ${params.nomeOrganizacao}\n` +
      `*Modalidade/Sessão:* ${params.recurso}\n` +
      `*Data:* ${params.data}\n` +
      `*Horário:* ${params.horario}\n` +
      (params.profissionalNome ? `*Profissional:* ${params.profissionalNome}\n` : '') +
      `\nAgendado via Plataforma Tech de Agendamento.`,
  )

  if (foneDestino) {
    return `https://wa.me/${foneDestino}?text=${texto}`
  }
  return `https://wa.me/?text=${texto}`
}

export const gerarLinkWhatsAppCancelamento = (params: {
  telefone?: string
  nomeUsuario: string
  nomeOrganizacao: string
  recurso: string
  data: string
  horario: string
}) => {
  const telLimpo = (params.telefone || '').replace(/\D/g, '')
  const foneDestino =
    telLimpo.length >= 10 ? (telLimpo.startsWith('55') ? telLimpo : `55${telLimpo}`) : ''

  const texto = encodeURIComponent(
    `Aviso de Cancelamento:\n\n` +
      `*Aluno(a):* ${params.nomeUsuario}\n` +
      `*Local:* ${params.nomeOrganizacao}\n` +
      `*Sessão:* ${params.recurso}\n` +
      `*Data:* ${params.data}\n` +
      `*Horário:* ${params.horario}\n` +
      `\nO agendamento foi cancelado com sucesso.`,
  )

  if (foneDestino) {
    return `https://wa.me/${foneDestino}?text=${texto}`
  }
  return `https://wa.me/?text=${texto}`
}
