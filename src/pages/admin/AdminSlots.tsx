import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import {
  getOrganizacoes,
  getProfissionais,
  getSlots,
  createSlot,
  updateSlot,
  deleteSlot,
} from '@/services/agendaService'
import { Organizacao, Slot, User } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Building2,
  User as UserIcon,
  Users,
  Sparkles,
  Loader2,
} from 'lucide-react'

export default function AdminSlots() {
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [profissionais, setProfissionais] = useState<User[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [dataFiltro, setDataFiltro] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)
  const [formOrgId, setFormOrgId] = useState('')
  const [formProfId, setFormProfId] = useState('')
  const [formData, setFormData] = useState('')
  const [formInicio, setFormInicio] = useState('08:00')
  const [formFim, setFormFim] = useState('09:00')
  const [formRecurso, setFormRecurso] = useState('Studio Pilates - Sala A')
  const [formQuantidade, setFormQuantidade] = useState<number>(5)
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  // 1. Carregar organizações e profissionais
  useEffect(() => {
    const carregarIniciais = async () => {
      setLoading(true)
      try {
        const [orgs, profs] = await Promise.all([getOrganizacoes(), getProfissionais()])
        setOrganizacoes(orgs)
        setProfissionais(profs)

        if (orgs.length > 0) {
          setSelectedOrgId(orgs[0].id)
          setFormOrgId(orgs[0].id)
        }
        if (profs.length > 0) {
          setFormProfId(profs[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    carregarIniciais()
  }, [])

  // 2. Carregar slots
  const carregarSlots = useCallback(async () => {
    if (!selectedOrgId) return
    setLoadingSlots(true)
    try {
      const data = await getSlots({
        organizacaoId: selectedOrgId,
        data: dataFiltro || undefined,
        apenasAtivos: false,
      })
      setSlots(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao buscar slots',
        description: 'Não foi possível carregar a grade.',
        variant: 'destructive',
      })
    } finally {
      setLoadingSlots(false)
    }
  }, [selectedOrgId, dataFiltro, toast])

  useEffect(() => {
    carregarSlots()
  }, [carregarSlots])

  const handleOpenModal = (slot?: Slot) => {
    if (slot) {
      setEditingSlot(slot)
      setFormOrgId(slot.id_organizacao)
      setFormProfId(slot.id_profissional || '')
      setFormData(slot.data)
      setFormInicio(slot.inicio)
      setFormFim(slot.fim)
      setFormRecurso(slot.recurso)
      setFormQuantidade(slot.quantidade)
    } else {
      setEditingSlot(null)
      setFormOrgId(selectedOrgId || organizacoes[0]?.id || '')
      setFormProfId(profissionais[0]?.id || '')
      setFormData(dataFiltro)
      setFormInicio('08:00')
      setFormFim('09:00')
      setFormRecurso('Studio Pilates - Sala A')
      setFormQuantidade(5)
    }
    setModalOpen(true)
  }

  const handleSalvarSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formOrgId || !formData || !formInicio || !formFim || !formRecurso || !formQuantidade) {
      toast({
        title: 'Campos incompletos',
        description: 'Preencha todos os campos obrigatórios da sessão.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingSlot) {
        await updateSlot(editingSlot.id, {
          id_organizacao: formOrgId,
          id_profissional: formProfId || undefined,
          data: formData,
          inicio: formInicio,
          fim: formFim,
          recurso: formRecurso,
          quantidade: Number(formQuantidade),
        })
        toast({ title: 'Slot atualizado com sucesso!' })
      } else {
        await createSlot({
          id_organizacao: formOrgId,
          id_profissional: formProfId || undefined,
          data: formData,
          inicio: formInicio,
          fim: formFim,
          recurso: formRecurso,
          quantidade: Number(formQuantidade),
          quantidade_utilizada: 0,
          ativo: true,
        })
        toast({ title: 'Novo horário criado na grade!' })
      }
      setModalOpen(false)
      await carregarSlots()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      toast({
        title: 'Erro ao preencher agenda',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Excluir este slot da agenda?')) return
    try {
      await deleteSlot(id)
      toast({ title: 'Slot removido' })
      await carregarSlots()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir'
      toast({
        title: 'Erro ao excluir',
        description: msg,
        variant: 'destructive',
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Preencher Agenda & Gerenciar Slots
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Crie horários com capacidade máxima por sessão, vincule o profissional e acompanhe
              ocupações.
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs sm:text-sm h-9 px-4 self-start shadow-md shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar Horário (Slot)
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="space-y-1">
            <Label className="text-xs text-slate-300">Academia / Organização</Label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            >
              {organizacoes.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nome} ({org.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-300">Data da Agenda</Label>
            <Input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="h-10 rounded-xl bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        {/* Grade de Slots */}
        {loadingSlots ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
            <p className="text-xs">Carregando slots da data...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
            <CalendarIcon className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-200">
              Nenhum slot cadastrado nesta data
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Clique em "Adicionar Horário (Slot)" para abrir horários para os alunos agendarem.
            </p>
            <Button
              size="sm"
              onClick={() => handleOpenModal()}
              className="rounded-full bg-cyan-600 text-xs mt-2"
            >
              Criar Primeiro Slot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const capacidade = slot.quantidade
              const ocupadas = slot.quantidade_utilizada || 0
              const livres = Math.max(0, capacidade - ocupadas)
              const percentual = Math.round((ocupadas / capacidade) * 100)

              return (
                <Card
                  key={slot.id}
                  className="bg-slate-900/70 border-slate-800 rounded-2xl hover:border-slate-700 transition-all overflow-hidden"
                >
                  <CardHeader className="pb-2 pt-4 flex flex-row items-start justify-between">
                    <div>
                      <Badge className="bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 text-[10px] mb-1">
                        {slot.recurso}
                      </Badge>
                      <CardTitle className="text-lg font-bold text-white flex items-center gap-1.5 mt-1">
                        <Clock className="h-4 w-4 text-cyan-400" />
                        {slot.inicio} às {slot.fim}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(slot)}
                        className="rounded-full text-slate-400 hover:text-cyan-400 h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="rounded-full text-slate-400 hover:text-rose-400 h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                      <UserIcon className="h-4 w-4 text-blue-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">
                          Profissional / Fisioterapeuta
                        </span>
                        <span className="font-semibold text-slate-200">
                          {slot.expand?.id_profissional?.name || 'Não atribuído'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Ocupação da Sessão:
                        </span>
                        <span className="font-mono text-slate-300">
                          <strong>{ocupadas}</strong> / {capacidade} vagas ({livres} livres)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            livres === 0
                              ? 'bg-rose-500'
                              : percentual > 75
                                ? 'bg-amber-400'
                                : 'bg-cyan-400'
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Slot */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              {editingSlot ? 'Editar Horário (Slot)' : 'Preencher Novo Horário (Slot)'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvarSlot} className="space-y-3.5 text-xs py-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Academia / Organização</Label>
              <select
                value={formOrgId}
                onChange={(e) => setFormOrgId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              >
                {organizacoes.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.nome} ({org.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Profissional Responsável</Label>
              <select
                value={formProfId}
                onChange={(e) => setFormProfId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              >
                {profissionais.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name || prof.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Data</Label>
              <Input
                type="date"
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Início (HH:mm)</Label>
                <Input
                  value={formInicio}
                  onChange={(e) => setFormInicio(e.target.value)}
                  placeholder="08:00"
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Fim (HH:mm)</Label>
                <Input
                  value={formFim}
                  onChange={(e) => setFormFim(e.target.value)}
                  placeholder="09:00"
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Recurso / Modalidade da Sessão</Label>
              <Input
                value={formRecurso}
                onChange={(e) => setFormRecurso(e.target.value)}
                placeholder="Ex: Studio Pilates - Sala A"
                className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">
                Capacidade da Sessão (Quantidade máxima de vagas simultâneas)
              </Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formQuantidade}
                onChange={(e) => setFormQuantidade(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="rounded-full border-slate-800 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                size="sm"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs px-5 shadow-md shadow-cyan-500/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Slot'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
