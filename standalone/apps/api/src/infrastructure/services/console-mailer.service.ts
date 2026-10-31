import { IMailerService } from '../../application/services/ports.js'

export class ConsoleMailerService implements IMailerService {
  async sendMail(options: {
    to: string
    subject: string
    text: string
    html?: string
  }): Promise<{ success: boolean; messageId?: string }> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    console.log('--------------------------------------------------')
    console.log(`[Mailer] Simulação de envio de e-mail (ConsoleMailerService):`)
    console.log(`Para: ${options.to}`)
    console.log(`Assunto: ${options.subject}`)
    console.log(`Texto: ${options.text}`)
    if (options.html) {
      console.log(`HTML: (tamanho ${options.html.length} chars)`)
    }
    console.log(`MessageId: ${messageId}`)
    console.log('--------------------------------------------------')
    return { success: true, messageId }
  }
}
