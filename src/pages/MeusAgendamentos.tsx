import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserNavbar } from '@/components/UserNavbar'
import { getAgendamentosDoUsuario, cancelarAgendamento } from '@/services/agendaService'
import { Agendamento } from '@/types/schema'
import { gerarLinkWhatsAppCancelamento } from '@/lib/whatsapp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar,
  Clock,
  Building2,
  User as UserIcon,
  XCircle,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from 'lucide-react'

export default function MeusAgendamentos() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [agendamentoToCancel, setAgendamentoToCancel] = useState<Agendamento | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [canceladoSucesso, setCanceladoSucesso] = useState<{
    agendamento: Agendamento
    whatsappUrl: string
  } | null>(null)

  const carregarAgendamentos = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const list = await getAgendamentosDoUsuario(user.id)
      setAgendamentos(list)
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar seus agendamentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    carregarAgendamentos()
  }, [isAuthenticated, navigate, carregarAgendamentos])

  const handleConfirmarCancelamento = async () => {
    if (!agendamentoToCancel || !user) return

    setCancelling(true)
    try {
      const atualizado = await cancelarAgendamento(agendamentoToCancel.id)

      const slot = agendamentoToCancel.expand?.id_slot
      const org = agendamentoToCancel.expand?.id_organizacao

      const waUrl = gerarLinkWhatsAppCancelamento({
        telefone: org?.telefone,
        nomeUsuario: user.name || user.email,
        nomeOrganizacao: org?.nome || 'Academia',
        recurso: slot?.recurso || 'Sessão',
        data: slot?.data || '',
        horario: slot ? `${slot.inicio} às ${slot.fim}` : '',
      })

      setCanceladoSucesso({
        agendamento: atualizado,
        whatsappUrl: waUrl,
      })

      toast({
        title: 'Agendamento cancelado',
        description: 'A vaga foi liberada e seu saldo de slots foi restabelecido.',
      })

      await carregarAgendamentos()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cancelar'
      toast({
        title: 'Não foi possível cancelar',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return (
          <Badge className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[10px]">
            Confirmado
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge className="bg-rose-950/60 text-rose-300 border border-rose-800/50 text-[10px]">
            Cancelado
          </Badge>
        )
      case 'concluido':
        return (
          <Badge className="bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[10px]">
            Concluído
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white pb-16">
      <UserNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Meus Agendamentos</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Histórico de sessões reservadas, vagas garantidas e cancelamentos.
            </p>
          </div>
          <Button
            onClick={() => navigate('/agendar')}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs sm:text-sm h-9 px-4 self-start"
          >
            Agendar Nova Sessão
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
            <p className="text-xs">Carregando seus agendamentos...</p>
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800/80 bg-slate-900/40 text-center space-y-4">
            <Calendar className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">
              Você ainda não possui nenhum agendamento
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Navegue pelas academias parceiras e garanta sua vaga nos horários disponíveis.
            </p>
            <Button
              onClick={() => navigate('/agendar')}
              className="rounded-full bg-cyan-600 hover:bg-cyan-500 text-xs px-6"
            >
              Ver Horários com Vagas
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {agendamentos.map((ag) => {
              const slot = ag.expand?.id_slot
              const org = ag.expand?.id_organizacao
              const isAgendado = ag.status === 'agendado'

              return (
                <Card
                  key={ag.id}
                  className="bg-slate-900/70 border-slate-800 rounded-2xl hover:border-slate-700 transition-all overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ag.status)}
                        <span className="text-xs font-semibold text-cyan-400">
                          {slot?.recurso || 'Sessão'}
                        </span>
                        <span className="text-slate-500 text-xs">•</span>
                        <span className="text-xs text-slate-300 font-medium">
                          {org?.nome || 'Academia'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                          <span>
                            Data:{' '}
                            <strong className="text-white">
                              {slot?.data || 'Data indisponível'}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-cyan-400" />
                          <span>
                            Horário:{' '}
                            <strong className="text-white">
                              {slot?.inicio} às {slot?.fim}
                            </strong>
                          </span>
                        </div>
                        {slot?.expand?.id_profissional && (
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="h-3.5 w-3.5 text-blue-400" />
                            <span>Profissional: {slot.expand.id_profissional.name}</span>
                          </div>
                        )}
                      </div>

                      {ag.observacao && (
                        <div className="text-[11px] text-slate-400 italic pt-1">
                          "{ag.observacao}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAgendado && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setAgendamentoToCancel(ag)}
                          className="rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900 text-xs h-8 px-3.5"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Cancelar Vaga
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal de Cancelamento */}
      <Dialog
        open={!!agendamentoToCancel && !canceladoSucesso}
        onOpenChange={(open) => !open && setAgendamentoToCancel(null)}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Cancelar Agendamento?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Ao cancelar, sua vaga será liberada imediatamente para outro aluno e o slot será
              estornado em seu contrato.
            </DialogDescription>
          </DialogHeader>

          {agendamentoToCancel && (
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div>
                Sessão:{' '}
                <strong className="text-white">
                  {agendamentoToCancel.expand?.id_slot?.recurso}
                </strong>
              </div>
              <div>
                Data: {agendamentoToCancel.expand?.id_slot?.data} das{' '}
                {agendamentoToCancel.expand?.id_slot?.inicio} às{' '}
                {agendamentoToCancel.expand?.id_slot?.fim}
              </div>
              <div>Local: {agendamentoToCancel.expand?.id_organizacao?.nome}</div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAgendamentoToCancel(null)}
              className="rounded-full border-slate-800 text-xs"
            >
              Voltar
            </Button>
            <Button
              disabled={cancelling}
              variant="destructive"
              size="sm"
              onClick={handleConfirmarCancelamento}
              className="rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs px-4"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Cancelando...
                </>
              ) : (
                'Sim, Cancelar Vaga'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Sucesso no Cancelamento com Link WhatsApp */}
      <Dialog
        open={!!canceladoSucesso}
        onOpenChange={(open) => {
          if (!open) {
            setCanceladoSucesso(null)
            setAgendamentoToCancel(null)
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center my-2">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Cancelamento Concluído!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            A vaga foi liberada na grade e seu saldo de slots foi estornado.
          </DialogDescription>

          <div className="pt-4 space-y-2">
            {canceladoSucesso && (
              <a
                href={canceladoSucesso.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Avisar Academia no WhatsApp
              </a>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setCanceladoSucesso(null)
                setAgendamentoToCancel(null)
              }}
              className="w-full rounded-full border-slate-800 text-slate-300 text-xs h-9"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
