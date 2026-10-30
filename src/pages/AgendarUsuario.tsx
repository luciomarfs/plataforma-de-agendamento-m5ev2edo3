import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserNavbar } from '@/components/UserNavbar'
import { SlotCard } from '@/components/SlotCard'
import {
  getOrganizacoes,
  getSlots,
  realizarAgendamento,
  getContratos,
} from '@/services/agendaService'
import { Organizacao, Slot, Contrato } from '@/types/schema'
import { gerarLinkWhatsAppConfirmacao } from '@/lib/whatsapp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Building2,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  MapPin,
  Loader2,
} from 'lucide-react'

export default function AgendarUsuario() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [slots, setSlots] = useState<Slot[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false)

  // Modal de confirmação
  const [slotToBook, setSlotToBook] = useState<Slot | null>(null)
  const [observacao, setObservacao] = useState<string>('')
  const [bookingLoading, setBookingLoading] = useState<boolean>(false)
  const [confirmacaoSucesso, setConfirmacaoSucesso] = useState<{
    slot: Slot
    orgNome: string
    whatsappUrl: string
  } | null>(null)

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const orgs = await getOrganizacoes()
        setOrganizacoes(orgs)
        if (orgs.length > 0) {
          setSelectedOrgId(orgs[0].id)
        }
        if (user?.id) {
          const userContracts = await getContratos(user.id)
          setContratos(userContracts)
        }
      } catch (err) {
        console.error('Erro ao carregar organizações:', err)
      }
    }
    carregarDadosIniciais()
  }, [user?.id])

  const carregarSlots = useCallback(async () => {
    if (!selectedOrgId) return
    setLoadingSlots(true)
    try {
      const items = await getSlots({
        organizacaoId: selectedOrgId,
        data: dataSelecionada || undefined,
        apenasAtivos: true,
      })
      setSlots(items)
    } catch (err) {
      console.error('Erro ao carregar slots:', err)
      toast({
        title: 'Erro ao buscar horários',
        description: 'Não foi possível carregar a grade de slots.',
        variant: 'destructive',
      })
    } finally {
      setLoadingSlots(false)
    }
  }, [selectedOrgId, dataSelecionada, toast])

  useEffect(() => {
    carregarSlots()
  }, [carregarSlots])

  const contratoAtual = contratos.find(
    (c) => c.id_organizacao === selectedOrgId && c.ativo === true,
  )

  const handleOpenBookingModal = (slot: Slot) => {
    if (!isAuthenticated) {
      toast({
        title: 'Faça login primeiro',
        description: 'Você precisa estar autenticado para agendar um horário.',
      })
      navigate('/login')
      return
    }

    const vagasRestantes = slot.quantidade - (slot.quantidade_utilizada || 0)
    if (vagasRestantes <= 0) {
      toast({
        title: 'Capacidade esgotada',
        description: 'Este horário atingiu a capacidade máxima por sessão.',
        variant: 'destructive',
      })
      return
    }

    setObservacao('')
    setSlotToBook(slot)
  }

  const handleConfirmarAgendamento = async () => {
    if (!slotToBook || !user) return

    setBookingLoading(true)
    try {
      await realizarAgendamento({
        slotId: slotToBook.id,
        userId: user.id,
        organizacaoId: slotToBook.id_organizacao,
        observacao,
      })

      const org = organizacoes.find((o) => o.id === slotToBook.id_organizacao)
      const prof = slotToBook.expand?.id_profissional

      const waUrl = gerarLinkWhatsAppConfirmacao({
        telefone: org?.telefone,
        nomeUsuario: user.name || user.email,
        nomeOrganizacao: org?.nome || 'Academia',
        recurso: slotToBook.recurso,
        data: slotToBook.data,
        horario: `${slotToBook.inicio} às ${slotToBook.fim}`,
        profissionalNome: prof?.name,
      })

      setConfirmacaoSucesso({
        slot: slotToBook,
        orgNome: org?.nome || 'Academia',
        whatsappUrl: waUrl,
      })

      toast({
        title: 'Agendamento Confirmado!',
        description: `Vaga reservada para ${slotToBook.data} às ${slotToBook.inicio}.`,
      })

      await carregarSlots()
      if (user.id) {
        const userContracts = await getContratos(user.id)
        setContratos(userContracts)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao agendar'
      toast({
        title: 'Não foi possível agendar',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white pb-16">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-[450px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-96 left-10 w-[450px] h-[350px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <UserNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 mb-2">
              <Sparkles className="h-3 w-3" />
              Sessões com Capacidade Limitada
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agendar Horários & Sessões
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Escolha a academia parceira, a data desejada e garanta sua vaga na sessão.
            </p>
          </div>

          {contratoAtual ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="text-cyan-300 font-semibold flex items-center gap-1.5">
                  <span>{contratoAtual.plano_nome || 'Contrato Ativo'}</span>
                  <Badge
                    variant="secondary"
                    className="bg-cyan-500/20 text-cyan-300 border-none text-[10px] h-4"
                  >
                    Ativo
                  </Badge>
                </div>
                <div className="text-slate-400 mt-0.5">
                  Saldo de slots:{' '}
                  <strong className="text-white">{contratoAtual.saldo_slots ?? 'Ilimitado'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              <span>Nenhum contrato ativo para esta unidade. (Permitido agendamento avulso)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-md">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-cyan-400" />
              Academia / Organização
            </Label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs sm:text-sm focus:border-cyan-500 focus:outline-none"
            >
              {organizacoes.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nome} ({org.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-cyan-400" />
              Data da Sessão
            </Label>
            <Input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="h-10 rounded-xl bg-slate-950/80 border-slate-700/80 text-white text-xs sm:text-sm focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-col justify-center text-xs text-slate-400 space-y-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4">
            {selectedOrgId && (
              <>
                <div className="text-slate-200 font-medium flex items-center gap-1 truncate">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  {organizacoes.find((o) => o.id === selectedOrgId)?.endereco || 'Endereço Central'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {organizacoes.find((o) => o.id === selectedOrgId)?.descricao ||
                    'Pilates, Fisioterapia & Treinos'}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Horários Disponíveis ({dataSelecionada})
            </h2>
            <span className="text-xs text-slate-400">
              {slots.length} {slots.length === 1 ? 'sessão configurada' : 'sessões configuradas'}
            </span>
          </div>

          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
              <p className="text-xs">Consultando vagas no banco de dados...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="p-12 rounded-3xl border border-slate-800/80 bg-slate-900/40 text-center space-y-3">
              <CalendarIcon className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">
                Nenhum slot cadastrado para esta data
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não há sessões programadas em {dataSelecionada}. Altere a data no filtro acima.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDataSelecionada(new Date().toISOString().split('T')[0])}
                  className="rounded-full border-slate-700 text-xs"
                >
                  Voltar para Hoje
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/admin/slots')}
                  className="rounded-full bg-cyan-600 hover:bg-cyan-500 text-xs"
                >
                  Preencher Agenda (Admin)
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} onSelect={handleOpenBookingModal} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={!!slotToBook && !confirmacaoSucesso}
        onOpenChange={(open) => !open && setSlotToBook(null)}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Confirmar Agendamento
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Verifique os detalhes da sessão antes de confirmar sua reserva de capacidade.
            </DialogDescription>
          </DialogHeader>

          {slotToBook && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Modalidade:</span>
                  <strong className="text-cyan-400">{slotToBook.recurso}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data & Horário:</span>
                  <strong className="text-white">
                    {slotToBook.data} • {slotToBook.inicio} às {slotToBook.fim}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profissional:</span>
                  <span className="text-slate-200">
                    {slotToBook.expand?.id_profissional?.name || 'Equipe Especializada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacidade da Sessão:</span>
                  <span className="text-slate-300">
                    {slotToBook.quantidade - (slotToBook.quantidade_utilizada || 0)} vagas livres de{' '}
                    {slotToBook.quantidade}
                  </span>
                </div>
              </div>

              {contratoAtual && (
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 flex items-center justify-between text-[11px]">
                  <span>Será debitado 1 slot do seu plano:</span>
                  <strong>Saldo restante: {(contratoAtual.saldo_slots ?? 1) - 1}</strong>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Observações adicionais (opcional):</Label>
                <Input
                  placeholder="Ex: Foco em dor lombar, primeiro dia, etc."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSlotToBook(null)}
              className="rounded-full border-slate-800 text-xs"
            >
              Cancelar
            </Button>
            <Button
              disabled={bookingLoading}
              size="sm"
              onClick={handleConfirmarAgendamento}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs shadow-md shadow-cyan-500/25 px-5"
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Reservando vaga...
                </>
              ) : (
                'Garantir Minha Vaga'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmacaoSucesso}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmacaoSucesso(null)
            setSlotToBook(null)
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center my-2">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Vaga Garantida com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Seu agendamento foi registrado e a vaga foi alocada no sistema.
          </DialogDescription>

          {confirmacaoSucesso && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 text-left my-2">
              <div>
                <span className="text-slate-500 block text-[10px]">LOCAL</span>
                <strong className="text-white">{confirmacaoSucesso.orgNome}</strong>
              </div>
              <div className="flex justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">DATA</span>
                  <span className="text-cyan-400 font-medium">{confirmacaoSucesso.slot.data}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">HORÁRIO</span>
                  <span className="text-cyan-400 font-medium">
                    {confirmacaoSucesso.slot.inicio} às {confirmacaoSucesso.slot.fim}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 space-y-2">
            {confirmacaoSucesso && (
              <a
                href={confirmacaoSucesso.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
              >
                <MessageSquare className="h-4 w-4" />
                Enviar Confirmação no WhatsApp
              </a>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setConfirmacaoSucesso(null)
                setSlotToBook(null)
                navigate('/meus-agendamentos')
              }}
              className="w-full rounded-full border-slate-800 text-slate-300 hover:text-white text-xs h-9"
            >
              Ver Meus Agendamentos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
