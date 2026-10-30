import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import {
  getContratos,
  getUsuarios,
  getOrganizacoes,
  createContrato,
  updateContrato,
  deleteContrato,
} from '@/services/agendaService'
import { Contrato, User, Organizacao } from '@/types/schema'
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
  FileText,
  Plus,
  Pencil,
  Trash2,
  Building2,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'

export default function AdminContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null)
  const [formUserId, setFormUserId] = useState('')
  const [formOrgId, setFormOrgId] = useState('')
  const [formPlanoNome, setFormPlanoNome] = useState('Plano Mensal Fisioterapia & Pilates')
  const [formDataInicio, setFormDataInicio] = useState('2025-01-01')
  const [formDataFim, setFormDataFim] = useState('2025-12-31')
  const [formSlotsDia, setFormSlotsDia] = useState<number>(2)
  const [formSlotsSemana, setFormSlotsSemana] = useState<number>(4)
  const [formSlotsMes, setFormSlotsMes] = useState<number>(16)
  const [formSaldoSlots, setFormSaldoSlots] = useState<number>(16)
  const [formAtivo, setFormAtivo] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [c, u, o] = await Promise.all([getContratos(), getUsuarios(), getOrganizacoes()])
      setContratos(c)
      setUsuarios(u)
      setOrganizacoes(o)
      if (u.length > 0) setFormUserId(u[0].id)
      if (o.length > 0) setFormOrgId(o[0].id)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar contratos',
        description: 'Não foi possível buscar a lista.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const handleOpenModal = (contrato?: Contrato) => {
    if (contrato) {
      setEditingContrato(contrato)
      setFormUserId(contrato.id_usuario)
      setFormOrgId(contrato.id_organizacao)
      setFormPlanoNome(contrato.plano_nome || '')
      setFormDataInicio(contrato.data_inicio)
      setFormDataFim(contrato.data_fim)
      setFormSlotsDia(contrato.slots_por_dia ?? 2)
      setFormSlotsSemana(contrato.slots_por_semana ?? 4)
      setFormSlotsMes(contrato.slots_por_mes ?? 16)
      setFormSaldoSlots(contrato.saldo_slots ?? 10)
      setFormAtivo(contrato.ativo)
    } else {
      setEditingContrato(null)
      setFormUserId(usuarios[0]?.id || '')
      setFormOrgId(organizacoes[0]?.id || '')
      setFormPlanoNome('Plano Fisioterapia & Pilates Gold')
      setFormDataInicio('2025-01-01')
      setFormDataFim('2025-12-31')
      setFormSlotsDia(2)
      setFormSlotsSemana(4)
      setFormSlotsMes(16)
      setFormSaldoSlots(12)
      setFormAtivo(true)
    }
    setModalOpen(true)
  }

  const handleSalvarContrato = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUserId || !formOrgId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione o usuário e a academia.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingContrato) {
        await updateContrato(editingContrato.id, {
          id_usuario: formUserId,
          id_organizacao: formOrgId,
          plano_nome: formPlanoNome,
          data_inicio: formDataInicio,
          data_fim: formDataFim,
          slots_por_dia: Number(formSlotsDia),
          slots_por_semana: Number(formSlotsSemana),
          slots_por_mes: Number(formSlotsMes),
          saldo_slots: Number(formSaldoSlots),
          ativo: formAtivo,
        })
        toast({ title: 'Contrato atualizado com sucesso!' })
      } else {
        await createContrato({
          id_usuario: formUserId,
          id_organizacao: formOrgId,
          plano_nome: formPlanoNome,
          data_inicio: formDataInicio,
          data_fim: formDataFim,
          slots_por_dia: Number(formSlotsDia),
          slots_por_semana: Number(formSlotsSemana),
          slots_por_mes: Number(formSlotsMes),
          saldo_slots: Number(formSaldoSlots),
          ativo: formAtivo,
        })
        toast({ title: 'Novo contrato cadastrado!' })
      }
      setModalOpen(false)
      await carregarDados()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      toast({
        title: 'Erro ao salvar contrato',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteContrato = async (id: string) => {
    if (!window.confirm('Deseja excluir este contrato?')) return
    try {
      await deleteContrato(id)
      toast({ title: 'Contrato removido com sucesso' })
      await carregarDados()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir'
      toast({
        title: 'Erro ao excluir contrato',
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Contratos</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Defina cotas de sessões (dia, semana, mês) e saldos de slots para os alunos.
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs sm:text-sm h-9 px-4 self-start shadow-md shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Contrato
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
            <p className="text-xs">Carregando contratos...</p>
          </div>
        ) : contratos.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center">
            <FileText className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">Nenhum contrato ativo</h3>
            <p className="text-xs text-slate-400 mt-1">
              Crie um contrato para conceder slots aos alunos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contratos.map((c) => {
              const u = c.expand?.id_usuario
              const org = c.expand?.id_organizacao

              return (
                <Card
                  key={c.id}
                  className="bg-slate-900/70 border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
                >
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {c.ativo ? (
                          <Badge className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[10px]">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 text-[10px]">
                            Inativo
                          </Badge>
                        )}
                        <span className="text-xs font-semibold text-white">
                          {c.plano_nome || 'Contrato Padrão'}
                        </span>
                      </div>
                      <CardTitle className="text-base text-cyan-400 flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4" />
                        {u?.name || u?.email}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(c)}
                        className="rounded-full text-slate-400 hover:text-cyan-400 h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteContrato(c.id)}
                        className="rounded-full text-slate-400 hover:text-rose-400 h-8 w-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span>{org?.nome}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Saldo Atual de Slots:
                        </span>
                        <strong className="text-sm text-cyan-400 font-mono">
                          {c.saldo_slots ?? '0'} vagas
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Limite / Dia:</span>
                        <span className="text-xs text-white font-mono">
                          {c.slots_por_dia ?? '2'} slots
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Limite / Semana:</span>
                        <span className="text-xs text-white font-mono">
                          {c.slots_por_semana ?? '4'} slots
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Limite / Mês:</span>
                        <span className="text-xs text-white font-mono">
                          {c.slots_por_mes ?? '16'} slots
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Vigência:</span>
                      <span className="text-slate-300">
                        {c.data_inicio} até {c.data_fim}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal CRUD Contrato */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              {editingContrato ? 'Editar Contrato' : 'Novo Contrato de Aluno'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvarContrato} className="space-y-3.5 text-xs py-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Aluno / Usuário</Label>
              <select
                value={formUserId}
                onChange={(e) => setFormUserId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              >
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>

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
              <Label className="text-xs text-slate-300">Nome do Plano</Label>
              <Input
                value={formPlanoNome}
                onChange={(e) => setFormPlanoNome(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Data Início</Label>
                <Input
                  type="date"
                  value={formDataInicio}
                  onChange={(e) => setFormDataInicio(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Data Fim</Label>
                <Input
                  type="date"
                  value={formDataFim}
                  onChange={(e) => setFormDataFim(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Slots por Dia</Label>
                <Input
                  type="number"
                  value={formSlotsDia}
                  onChange={(e) => setFormSlotsDia(Number(e.target.value))}
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Saldo Atual de Slots</Label>
                <Input
                  type="number"
                  value={formSaldoSlots}
                  onChange={(e) => setFormSaldoSlots(Number(e.target.value))}
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="ativoCheck"
                checked={formAtivo}
                onChange={(e) => setFormAtivo(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-cyan-500"
              />
              <Label htmlFor="ativoCheck" className="text-xs text-slate-300 cursor-pointer">
                Contrato Ativo
              </Label>
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
                  'Salvar Contrato'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
