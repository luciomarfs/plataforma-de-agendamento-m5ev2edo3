import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import {
  getOrganizacoes,
  createOrganizacao,
  updateOrganizacao,
  deleteOrganizacao,
} from '@/services/agendaService'
import { Organizacao } from '@/types/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Building2, Plus, Pencil, Trash2, MapPin, Phone, Hash, Loader2 } from 'lucide-react'

export default function AdminOrganizacoes() {
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organizacao | null>(null)

  // Form State
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  const carregar = async () => {
    setLoading(true)
    try {
      const data = await getOrganizacoes()
      setOrganizacoes(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as academias cadastradas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const handleOpenModal = (org?: Organizacao) => {
    if (org) {
      setEditingOrg(org)
      setCodigo(org.codigo)
      setNome(org.nome)
      setDescricao(org.descricao || '')
      setTelefone(org.telefone || '')
      setEndereco(org.endereco || '')
    } else {
      setEditingOrg(null)
      setCodigo(`ACAD-${Math.floor(100 + Math.random() * 900)}`)
      setNome('')
      setDescricao('')
      setTelefone('5511999990000')
      setEndereco('')
    }
    setModalOpen(true)
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo || !nome) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe o código único e o nome da organização.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingOrg) {
        await updateOrganizacao(editingOrg.id, {
          codigo,
          nome,
          descricao,
          telefone,
          endereco,
        })
        toast({ title: 'Academia atualizada com sucesso!' })
      } else {
        await createOrganizacao({
          codigo,
          nome,
          descricao,
          telefone,
          endereco,
        })
        toast({ title: 'Nova academia cadastrada com sucesso!' })
      }
      setModalOpen(false)
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      toast({
        title: 'Erro ao salvar organização',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta organização?')) return
    try {
      await deleteOrganizacao(id)
      toast({ title: 'Organização removida com sucesso' })
      await carregar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir'
      toast({
        title: 'Erro ao excluir organização',
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
              Academias & Organizações
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Cadastro de unidades parceiras, código único e informações de contato.
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs sm:text-sm h-9 px-4 self-start shadow-md shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Academia
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
            <p className="text-xs">Carregando organizações...</p>
          </div>
        ) : organizacoes.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center">
            <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">Nenhuma academia cadastrada</h3>
            <p className="text-xs text-slate-400 mt-1">
              Clique acima para adicionar a primeira unidade.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizacoes.map((org) => (
              <Card
                key={org.id}
                className="bg-slate-900/70 border-slate-800 rounded-2xl hover:border-cyan-500/30 transition-all"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 mb-1.5">
                      <Hash className="h-3 w-3" />
                      {org.codigo}
                    </div>
                    <CardTitle className="text-lg font-bold text-white">{org.nome}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenModal(org)}
                      className="rounded-full text-slate-400 hover:text-cyan-400 h-8 w-8"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(org.id)}
                      className="rounded-full text-slate-400 hover:text-rose-400 h-8 w-8"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-300">
                  {org.descricao && (
                    <p className="text-slate-400 text-[11px] leading-relaxed">{org.descricao}</p>
                  )}
                  {org.endereco && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{org.endereco}</span>
                    </div>
                  )}
                  {org.telefone && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{org.telefone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal CRUD Academia */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-400" />
              {editingOrg ? 'Editar Academia' : 'Nova Academia'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvar} className="space-y-3.5 text-xs py-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Código Único (Identificador)</Label>
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ex: ACAD-01"
                className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Nome da Organização</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: BioFit Centro Esportivo"
                className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Descrição / Especialidades</Label>
              <Input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Pilates, Musculação e Fisioterapia"
                className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Telefone / WhatsApp</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: 5511999990001"
                className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Endereço Completo</Label>
              <Input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
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
                  'Salvar Academia'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
