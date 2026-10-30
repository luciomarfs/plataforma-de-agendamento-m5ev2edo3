import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import {
  getUsuarios,
  getOrganizacoes,
  getAcessosEOrganizacoes,
  vincularProfissionalOrg,
  removerVinculoOrg,
  updateUsuarioPerfil,
} from '@/services/agendaService'
import { User, Organizacao, AcessoEOrganizacao } from '@/types/schema'
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
  Users,
  Building2,
  Plus,
  Trash2,
  Shield,
  UserCheck,
  Loader2,
  Phone,
  Mail,
} from 'lucide-react'

export default function AdminProfissionais() {
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [vinculos, setVinculos] = useState<AcessoEOrganizacao[]>([])
  const [loading, setLoading] = useState(true)

  // Modal de Vínculo
  const [modalVinculoOpen, setModalVinculoOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [papel, setPapel] = useState('profissional')
  const [tornarProfissional, setTornarProfissional] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [u, o, v] = await Promise.all([
        getUsuarios(),
        getOrganizacoes(),
        getAcessosEOrganizacoes(),
      ])
      setUsuarios(u)
      setOrganizacoes(o)
      setVinculos(v)

      if (u.length > 0) setSelectedUserId(u[0].id)
      if (o.length > 0) setSelectedOrgId(o[0].id)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar profissionais e vínculos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const handleVincular = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !selectedOrgId) {
      toast({
        title: 'Selecione os campos',
        description: 'Selecione um usuário e uma academia.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      // 1. Criar vínculo
      await vincularProfissionalOrg({
        id_usuario: selectedUserId,
        id_organizacao: selectedOrgId,
        papel,
      })

      // 2. Se marcada a opção, adicionar perfil 'profissional' no usuário
      if (tornarProfissional) {
        await updateUsuarioPerfil(selectedUserId, ['profissional', 'usuario'])
      }

      toast({
        title: 'Vínculo criado com sucesso!',
        description: 'Profissional vinculado à organização.',
      })
      setModalVinculoOpen(false)
      await carregarDados()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao vincular'
      toast({
        title: 'Erro ao vincular profissional',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoverVinculo = async (id: string) => {
    if (!window.confirm('Deseja remover este vínculo entre o profissional e a academia?')) return
    try {
      await removerVinculoOrg(id)
      toast({ title: 'Vínculo removido com sucesso' })
      await carregarDados()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover vínculo'
      toast({
        title: 'Erro ao remover',
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
              Profissionais & Múltiplas Academias
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Um mesmo profissional/fisioterapeuta pode atuar em mais de uma organização parceira.
            </p>
          </div>
          <Button
            onClick={() => setModalVinculoOpen(true)}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs sm:text-sm h-9 px-4 self-start shadow-md shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Vincular Profissional à Academia
          </Button>
        </div>

        {/* Lista de Vínculos Cadastrados */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
            <p className="text-xs">Carregando vínculos de profissionais...</p>
          </div>
        ) : vinculos.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center">
            <Users className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">Nenhum vínculo cadastrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              Vincule fisioterapeutas e personal trainers às suas respectivas academias.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vinculos.map((vinc) => {
              const u = vinc.expand?.id_usuario
              const org = vinc.expand?.id_organizacao

              return (
                <Card
                  key={vinc.id}
                  className="bg-slate-900/70 border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all"
                >
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div>
                      <Badge className="bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[10px] uppercase mb-1">
                        {vinc.papel || 'Profissional'}
                      </Badge>
                      <CardTitle className="text-base font-bold text-white">
                        {u?.name || u?.email || 'Usuário'}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverVinculo(vinc.id)}
                      className="rounded-full text-slate-400 hover:text-rose-400 h-8 w-8"
                      title="Remover Vínculo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">
                          Atuando na Academia:
                        </span>
                        <span className="font-semibold text-white">
                          {org?.nome || 'Organização'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{u?.email}</span>
                    </div>

                    {u?.phone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Vincular Profissional */}
      <Dialog open={modalVinculoOpen} onOpenChange={setModalVinculoOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-cyan-400" />
              Vincular Usuário à Organização
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleVincular} className="space-y-3.5 text-xs py-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Selecione o Usuário / Profissional</Label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
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
              <Label className="text-xs text-slate-300">Papel na Unidade</Label>
              <select
                value={papel}
                onChange={(e) => setPapel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              >
                <option value="profissional">Profissional / Fisioterapeuta</option>
                <option value="gestor">Gestor da Unidade</option>
                <option value="aluno">Aluno da Unidade</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="checkProf"
                checked={tornarProfissional}
                onChange={(e) => setTornarProfissional(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <Label htmlFor="checkProf" className="text-xs text-slate-300 cursor-pointer">
                Atribuir perfil 'profissional' no cadastro do usuário
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalVinculoOpen(false)}
                className="rounded-full border-slate-800 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                size="sm"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs px-5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Vinculando...
                  </>
                ) : (
                  'Confirmar Vínculo'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
