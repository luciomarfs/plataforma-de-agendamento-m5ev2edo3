import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Activity,
  Smartphone,
} from 'lucide-react'

export default function Index() {
  const { isAuthenticated, user, isAdmin, isGestor, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-[30%] -left-32 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                AgendFit Tech
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-mono tracking-widest uppercase">
                Capacidade & Saúde
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:text-cyan-400 text-slate-300 transition-colors h-9 w-9"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin || isGestor ? (
                  <Button
                    onClick={() => navigate('/admin')}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-md shadow-cyan-500/20 px-4 h-9 text-xs sm:text-sm"
                  >
                    Painel da Empresa
                  </Button>
                ) : null}
                <Button
                  onClick={() => navigate('/agendar')}
                  className="rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-cyan-300 font-medium px-4 h-9 text-xs sm:text-sm"
                >
                  Minha Agenda
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-900 h-9 px-3 text-xs"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="rounded-full text-slate-300 hover:text-white hover:bg-slate-900/80 px-4 h-9 text-xs sm:text-sm font-medium"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate('/cadastro')}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 px-5 h-9 text-xs sm:text-sm font-semibold transition-all hover:shadow-cyan-500/40"
                >
                  Criar Conta
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="py-20 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Tech Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-inner shadow-cyan-500/20">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Plataforma Inteligente de Agendamento por Sessão & Capacidade</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
            Agendamento de Alta Precisão para{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              Academias, Fisioterapia & Studios
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Controle de capacidade por sessão como em clínicas avançadas. Autenticação com ativação
            por e-mail, limites por contrato, múltiplos profissionais em várias academias e
            confirmação instantânea via WhatsApp.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/agendar' : '/login')}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-xl shadow-cyan-500/25 px-8 h-12 text-base transition-all hover:scale-105"
            >
              {isAuthenticated ? 'Acessar Meus Agendamentos' : 'Acessar e Agendar Horários'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login?admin=1')}
              className="rounded-full border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white px-7 h-12 text-base backdrop-blur-sm"
            >
              <Building2 className="h-4 w-4 mr-2 text-cyan-400" />
              Acesso Empresa / Admin
            </Button>
          </div>

          {/* Quick Stats Pills */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-left">
              <div className="text-2xl font-bold text-cyan-400">100% Real</div>
              <div className="text-xs text-slate-400 mt-1">Capacidade de vagas por sessão</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-left">
              <div className="text-2xl font-bold text-blue-400">Multi-Org</div>
              <div className="text-xs text-slate-400 mt-1">Profissionais em várias unidades</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-left">
              <div className="text-2xl font-bold text-teal-400">Contratos</div>
              <div className="text-xs text-slate-400 mt-1">Saldos por dia, semana e mês</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-left">
              <div className="text-2xl font-bold text-purple-400">WhatsApp</div>
              <div className="text-xs text-slate-400 mt-1">Confirmação & cancelamento direto</div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/80">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Dois Frontends em Uma Única Arquitetura
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Experiência ultra-rápida tanto para alunos quanto para administradores e
              fisioterapeutas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Usuário */}
            <div className="relative p-8 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm shadow-xl hover:border-cyan-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Portal do Aluno / Usuário</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Interface mobile-first focada em velocidade. O aluno pesquisa as academias
                disponíveis, confere vagas em tempo real por horário e realiza agendamento com um
                clique.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Visualização de vagas restantes (ex: 3 de 5 disponíveis)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Cancelamento com liberação automática de vaga
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Botão de WhatsApp para confirmação imediata
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Saldo de slots de acordo com seu plano contratado
                </li>
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/agendar')}
                  className="rounded-full w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                >
                  Explorar Vagas Disponíveis
                </Button>
              </div>
            </div>

            {/* Card Empresa */}
            <div className="relative p-8 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm shadow-xl hover:border-blue-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Área da Empresa / Admin</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Controle operacional completo para gestores de academias e estúdios. Gestão de
                múltiplas unidades, grade de slots e monitoramento de contratos.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  Preenchimento de agenda (data, horário início/fim, recurso e capacidade)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  Cadastro de profissionais atuando em várias organizações
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  Gestão de contratos com cotas (dia, semana, mês) e saldo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  Roadmap de Backlog integrado para evolução contínua
                </li>
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/admin')}
                  className="rounded-full w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20"
                >
                  Acessar Painel Corporativo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Informações de Demonstração */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/60 backdrop-blur-md">
            <h4 className="text-base font-semibold text-cyan-300 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              Acesso Rápido de Demonstração (PocketBase Conectado)
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Você pode se cadastrar diretamente com seu e-mail para receber link de ativação ou
              usar as credenciais pré-configuradas no banco de dados:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1">👑 Administrador</div>
                <div className="text-slate-300">luciomar.fs@gmail.com</div>
                <div className="text-slate-500">Senha: Skip@Pass</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-blue-400 font-bold mb-1">🩺 Profissional / Fisio</div>
                <div className="text-slate-300">prof.marcos@academia.com</div>
                <div className="text-slate-500">Senha: Skip@Pass</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-teal-400 font-bold mb-1">🏃 Aluno c/ Contrato</div>
                <div className="text-slate-300">aluno.demo@academia.com</div>
                <div className="text-slate-500">Senha: Skip@Pass</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">AgendFit Tech</span>
            <span>— Arquitetura Limpa com PocketBase</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/agendar" className="hover:text-cyan-400 transition-colors">
              Agendar Vagas
            </Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-cyan-400 transition-colors">
              Área da Empresa
            </Link>
            <span>•</span>
            <Link to="/admin/backlog" className="hover:text-cyan-400 transition-colors">
              Backlog do Produto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
