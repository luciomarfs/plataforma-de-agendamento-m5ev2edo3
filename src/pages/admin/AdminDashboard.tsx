import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/AdminLayout'
import {
  getOrganizacoes,
  getSlots,
  getTodosAgendamentos,
  getContratos,
} from '@/services/agendaService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Calendar,
  Users,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  AlertCircle,
} from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    orgsCount: 0,
    slotsCount: 0,
    agendamentosCount: 0,
    contratosCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        const [orgs, slots, agendamentos, contratos] = await Promise.all([
          getOrganizacoes(),
          getSlots({ apenasAtivos: false }),
          getTodosAgendamentos(),
          getContratos(),
        ])
        setStats({
          orgsCount: orgs.length,
          slotsCount: slots.length,
          agendamentosCount: agendamentos.length,
          contratosCount: contratos.length,
        })
      } catch (err) {
        console.error('Erro dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header com Boas-Vindas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/60 border border-blue-500/30 text-blue-400 mb-2">
              <Sparkles className="h-3 w-3" />
              Painel Geral de Controle
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestão de Academias & Sessões
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Controle de organizações, fisioterapeutas/profissionais, preenchimento de agenda e
              contratos.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/admin/slots')}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium text-xs sm:text-sm h-9 px-4 shadow-md shadow-cyan-500/20"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Preencher Nova Agenda
            </Button>
          </div>
        </div>

        {/* 4 Cards de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                Academias / Unidades
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                {stats.orgsCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[11px] text-slate-400">Organizações ativas</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                Slots Cadastrados
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                {stats.slotsCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[11px] text-slate-400">Horários configurados</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                Agendamentos
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                {stats.agendamentosCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[11px] text-slate-400">Total de reservas</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                Contratos Ativos
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                {stats.contratosCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[11px] text-slate-400">Planos de alunos</div>
            </CardContent>
          </Card>
        </div>

        {/* Atalhos Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Preencher Agenda (Slots)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Crie horários com capacidade de sessão (quantidade), vincule ao
                fisioterapeuta/profissional e gerencie a ocupação em tempo real.
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/slots')}
              variant="outline"
              className="mt-6 rounded-full border-slate-700 text-xs text-cyan-300 hover:bg-slate-800"
            >
              Gerenciar Slots
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Profissionais & Unidades</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vincule profissionais a mais de uma academia (relação N:N), controle perfis de
                acesso e atribua papéis na organização.
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/profissionais')}
              variant="outline"
              className="mt-6 rounded-full border-slate-700 text-xs text-blue-300 hover:bg-slate-800"
            >
              Configurar Profissionais
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Gestão de Contratos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Defina cotas de sessões por dia, semana e mês, controle saldos de slots e vincule
                alunos às academias parceiras.
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/contratos')}
              variant="outline"
              className="mt-6 rounded-full border-slate-700 text-xs text-purple-300 hover:bg-slate-800"
            >
              Ver Contratos
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
