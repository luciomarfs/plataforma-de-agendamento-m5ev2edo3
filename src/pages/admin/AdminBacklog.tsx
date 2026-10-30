import React, { useState } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { BacklogItem } from '@/types/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ListTodo, Plus, Sparkles, Clock, CheckCircle2, AlertCircle, Tag } from 'lucide-react'

const ITENS_INICIAIS_BACKLOG: BacklogItem[] = [
  {
    id: 'b1',
    titulo: 'Módulo de Controle Financeiro & Pagamentos',
    descricao:
      'Gestão de mensalidades, cobrança recorrente via PIX/Cartão e fluxo de caixa por academia.',
    prioridade: 'alta',
    status: 'planejado',
    categoria: 'Financeiro',
    estimativa: 'Sprint 2',
  },
  {
    id: 'b2',
    titulo: 'Emissão Automática de Nota Fiscal de Serviços (NFS-e)',
    descricao:
      'Integração de prefeituras para emissão de NFS-e após confirmação do pagamento de contratos.',
    prioridade: 'media',
    status: 'planejado',
    categoria: 'Fiscal',
    estimativa: 'Sprint 3',
  },
  {
    id: 'b3',
    titulo: 'Permissões Finas por Usuário (RBAC Avançado)',
    descricao:
      'Controle de privilégios detalhados por tela, unidade, relatórios e bloqueio de horários restritos.',
    prioridade: 'media',
    status: 'planejado',
    categoria: 'Segurança',
    estimativa: 'Sprint 2',
  },
  {
    id: 'b4',
    titulo: 'Integração com Catracas e Sistemas Externos de Acesso',
    descricao:
      'Comunicação via Webhooks e API REST para liberação de catracas físicas na porta da academia.',
    prioridade: 'baixa',
    status: 'planejado',
    categoria: 'Integrações',
    estimativa: 'Sprint 4',
  },
  {
    id: 'b5',
    titulo: 'Disparo de WhatsApp via API Oficial (Meta / Z-API)',
    descricao: 'Envio automático de lembrete 2h antes da sessão para reduzir faltas (no-show).',
    prioridade: 'alta',
    status: 'em_andamento',
    categoria: 'Comunicação',
    estimativa: 'Em desenvolvimento',
  },
]

export default function AdminBacklog() {
  const [itens, setItens] = useState<BacklogItem[]>(() => {
    const saved = localStorage.getItem('agendfit_backlog')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return ITENS_INICIAIS_BACKLOG
      }
    }
    return ITENS_INICIAIS_BACKLOG
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<'alta' | 'media' | 'baixa'>('media')
  const [status, setStatus] = useState<'planejado' | 'em_andamento' | 'concluido'>('planejado')
  const [categoria, setCategoria] = useState('Produto')
  const [estimativa, setEstimativa] = useState('Próximo ciclo')

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo) return

    const novoItem: BacklogItem = {
      id: `b_${Date.now()}`,
      titulo,
      descricao,
      prioridade,
      status,
      categoria,
      estimativa,
    }

    const atualizados = [novoItem, ...itens]
    setItens(atualizados)
    localStorage.setItem('agendfit_backlog', JSON.stringify(atualizados))
    setModalOpen(false)
    setTitulo('')
    setDescricao('')
  }

  const handleMudarStatus = (
    id: string,
    novoStatus: 'planejado' | 'em_andamento' | 'concluido',
  ) => {
    const atualizados = itens.map((item) =>
      item.id === id ? { ...item, status: novoStatus } : item,
    )
    setItens(atualizados)
    localStorage.setItem('agendfit_backlog', JSON.stringify(atualizados))
  }

  const getPrioridadeBadge = (p: string) => {
    switch (p) {
      case 'alta':
        return (
          <Badge className="bg-rose-950/60 text-rose-300 border-rose-800/50 text-[10px]">
            Alta
          </Badge>
        )
      case 'media':
        return (
          <Badge className="bg-amber-950/60 text-amber-300 border-amber-800/50 text-[10px]">
            Média
          </Badge>
        )
      default:
        return <Badge className="bg-slate-800 text-slate-300 text-[10px]">Baixa</Badge>
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'concluido':
        return (
          <Badge className="bg-emerald-950/60 text-emerald-300 border-emerald-800/50 text-[10px]">
            Concluído
          </Badge>
        )
      case 'em_andamento':
        return (
          <Badge className="bg-cyan-950/60 text-cyan-300 border-cyan-800/50 text-[10px]">
            Em Andamento
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-slate-400 text-[10px]">
            Planejado
          </Badge>
        )
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 mb-2">
              <Sparkles className="h-3 w-3" />
              Roadmap & Funcionalidades Futuras
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Backlog do Produto</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Itens deixados para depois conforme o escopo acordado (financeiro, notas fiscais,
              catracas e permissões finas).
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs sm:text-sm h-9 px-4 self-start shadow-md shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar ao Backlog
          </Button>
        </div>

        {/* Lista de Itens do Backlog */}
        <div className="space-y-3">
          {itens.map((item) => (
            <Card
              key={item.id}
              className="bg-slate-900/70 border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(item.status)}
                    {getPrioridadeBadge(item.prioridade)}
                    <Badge
                      variant="outline"
                      className="text-slate-400 border-slate-800 text-[10px] flex items-center gap-1"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {item.categoria}
                    </Badge>
                    {item.estimativa && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.estimativa}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white pt-1">{item.titulo}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.descricao}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleMudarStatus(
                        item.id,
                        e.target.value as 'planejado' | 'em_andamento' | 'concluido',
                      )
                    }
                    className="h-8 px-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
                  >
                    <option value="planejado">Planejado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Adicionar Item ao Backlog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-cyan-400" />
              Novo Item de Backlog
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvar} className="space-y-3 text-xs py-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Título da Funcionalidade</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Integração com Catraca Intelbras"
                className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Descrição / Escopo</Label>
              <Input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes do que será entregue e objetivos"
                className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Prioridade</Label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as 'alta' | 'media' | 'baixa')}
                  className="w-full h-9 px-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Categoria</Label>
                <Input
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex: Financeiro, Hardware"
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>
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
                size="sm"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs px-5 shadow-md shadow-cyan-500/20"
              >
                Registrar no Backlog
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
