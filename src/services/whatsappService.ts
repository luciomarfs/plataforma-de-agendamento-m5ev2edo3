import { Agendamento, Slot, Organizacao, User } from '@/domain/models'

/**
 * Utilitário para geração de mensagens e URLs wa.me para WhatsApp
 */
export const whatsappService = {
  /**
   * Sanitiza o número de telefone removendo caracteres não numéricos.
   * Adiciona o DDI 55 (Brasil) caso não venha com DDI.
   */
  formatPhoneNumber(phone?: string): string {
    if (!phone) return ''
    const clean = phone.replace(/\D/g, '')
    if (clean.length === 10 || clean.length === 11) {
      return `55${clean}`
    }
    return clean
  },

  /**
   * Monta o link wa.me com a mensagem formatada
   */
  buildWaMeUrl(phone: string, text: string): string {
    const cleanPhone = this.formatPhoneNumber(phone)
    const encodedText = encodeURIComponent(text)
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${encodedText}`
    }
    // Caso não tenha telefone, abre o WhatsApp Web permitindo escolher o contato
    return `https://wa.me/?text=${encodedText}`
  },

  /**
   * Gera texto de confirmação de agendamento
   */
  generateConfirmMessage(params: {
    userName: string
    orgName: string
    recurso: string
    data: string
    horario: string
    profissionalName?: string
  }): string {
    return [
      `🏋️‍♂️ *Confirmação de Agendamento*`,
      `Olá, *${params.userName}*! Seu horário foi agendado com sucesso na *${params.orgName}*.`,
      ``,
      `📅 *Data:* ${params.data}`,
      `⏰ *Horário:* ${params.horario}`,
      `📍 *Atividade / Espaço:* ${params.recurso}`,
      params.profissionalName ? `👤 *Profissional:* ${params.profissionalName}` : '',
      ``,
      `Caso precise remarcar ou cancelar, acesse a plataforma de agendamento com antecedência. Nos vemos lá!`,
    ]
      .filter(Boolean)
      .join('\n')
  },

  /**
   * Gera texto de cancelamento de agendamento
   */
  generateCancelMessage(params: {
    userName: string
    orgName: string
    recurso: string
    data: string
    horario: string
  }): string {
    return [
      `⚠️ *Aviso de Cancelamento de Agendamento*`,
      `Olá, *${params.userName}*. Informamos que seu agendamento na *${params.orgName}* foi cancelado.`,
      ``,
      `📅 *Data:* ${params.data}`,
      `⏰ *Horário:* ${params.horario}`,
      `📍 *Atividade:* ${params.recurso}`,
      `💳 Seu saldo de slots/sessões foi devolvido ao seu plano.`,
      ``,
      `Você pode realizar um novo agendamento a qualquer momento pela nossa plataforma!`,
    ].join('\n')
  },
}
