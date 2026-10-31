import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { NoWaitFitLogo } from '@/components/NoWaitFitLogo'
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
  Flame,
  Zap,
} from 'lucide-react'

export default function Index() {
  const { isAuthenticated, isAdmin, isGestor, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Background glow suave e gradientes mais vivos (tom mais brando, menos preto puro) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/25 via-emerald-500/15 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[25%] -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-blue-500/20 via-indigo-500/15 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[45%] -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-500/20 via-teal-500/15 to-transparent rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-1/4 w-[700px] h-[500px] bg-cyan-600/15 rounded-full blur-[160px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <NoWaitFitLogo size="sm" />
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold tracking-wider uppercase ml-1">
              Smart Agenda
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:text-cyan-400 text-slate-300 transition-colors h-9 w-9 shadow-sm"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin || isGestor ? (
                  <Button
                    onClick={() => navigate('/admin')}
                    className="rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 px-4 h-9 text-xs sm:text-sm"
                  >
                    Painel da Empresa
                  </Button>
                ) : null}
                <Button
                  onClick={() => navigate('/agendar')}
                  className="rounded-full bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-cyan-300 font-semibold px-4 h-9 text-xs sm:text-sm"
                >
                  Minha Agenda
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 h-9 px-3 text-xs"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="rounded-full text-slate-200 hover:text-white hover:bg-slate-800/80 px-4 h-9 text-xs sm:text-sm font-semibold"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate('/cadastro')}
                  className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/30 px-5 h-9 text-xs sm:text-sm font-bold transition-all hover:scale-105"
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
          {/* Logo Badge Hero */}
          <div className="mb-6 flex items-center justify-center">
            <NoWaitFitLogo size="lg" className="drop-shadow-lg" />
          </div>

          {/* Tech Pill Badge com acento vivo */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/40 text-emerald-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-inner shadow-emerald-500/20">
            <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Zero Filas • Alta Precisão • Capacidade por Sessão</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.12]">
            Agendamentos Inteligentes para{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Academias, Fisioterapia & Studios
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Elimine filas e ociosidade de equipamentos. Controle de capacidade em tempo real, gestão
            de múltiplos profissionais, contratos com saldo de slots e confirmação instantânea via
            WhatsApp.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/agendar' : '/login')}
              className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/30 px-8 h-12 text-base transition-all hover:scale-105"
            >
              {isAuthenticated ? 'Acessar Meus Agendamentos' : 'Agendar Horário Agora'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login?admin=1')}
              className="rounded-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-100 px-7 h-12 text-base backdrop-blur-sm shadow-md"
            >
              <Building2 className="h-4 w-4 mr-2 text-cyan-400" />
              Painel Empresa / Admin
            </Button>
          </div>

          {/* Quick Stats Pills com cores vibrantes */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="p-4 rounded-2xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-sm text-left hover:border-emerald-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-400">100% Real</span>
                <Flame className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                Vagas por sessão sem superlotação
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-sm text-left hover:border-cyan-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-cyan-400">Multi-Org</span>
                <Building2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                Várias unidades e filiais integradas
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-sm text-left hover:border-teal-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-teal-400">Contratos</span>
                <Clock className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                Controle de saldo e cotas de uso
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-sm text-left hover:border-amber-500/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-amber-400">WhatsApp</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                Confirmação instantânea no celular
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/80">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dois Frontends Dedicados na Mesma Plataforma
            </h2>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">
              Desenvolvidos para velocidade máxima tanto para alunos quanto para equipes de gestão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Usuário */}
            <div className="relative p-8 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-800/80 via-slate-800/50 to-slate-900/90 backdrop-blur-sm shadow-xl hover:border-emerald-400/50 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Portal do Aluno NoWaitFit</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Interface mobile-first rápida e objetiva. O aluno pesquisa as unidades disponíveis,
                confere vagas em tempo real por horário e realiza o agendamento com um clique.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Visualização de vagas restantes (ex: 3 de 5 disponíveis)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Cancelamento com estorno automático de vaga e saldo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Botão de WhatsApp para confirmação direta com o estúdio
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Saldo de slots atualizado instantaneamente conforme seu plano
                </li>
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/agendar')}
                  className="rounded-full w-full bg-slate-700/80 hover:bg-slate-700 text-emerald-300 border border-slate-600 font-semibold"
                >
                  Explorar Vagas Disponíveis
                </Button>
              </div>
            </div>

            {/* Card Empresa */}
            <div className="relative p-8 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-800/80 via-slate-800/50 to-slate-900/90 backdrop-blur-sm shadow-xl hover:border-cyan-400/50 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Painel Corporativo NoWaitFit</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Controle operacional completo para gestores de academias e estúdios. Gestão de
                múltiplas unidades, criação de slots individuais ou em lote e monitoramento de
                contratos.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Grade de slots com capacidade configurável e geração em lote
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Cadastro de profissionais atuando em várias unidades
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Gestão completa de contratos de alunos com cotas diárias/semanais/mensais
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  Métricas em tempo real integradas com PostgreSQL/PocketBase
                </li>
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/admin')}
                  className="rounded-full w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-md shadow-cyan-500/20"
                >
                  Acessar Painel Corporativo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Informações de Demonstração */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl border border-slate-700/80 bg-slate-800/70 backdrop-blur-md">
            <h4 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              Acesso Rápido de Demonstração
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Cadastre-se com seu e-mail para receber link de ativação ou use as credenciais de
              teste:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1">👑 Administrador</div>
                <div className="text-slate-200">luciomar.fs@gmail.com</div>
                <div className="text-slate-400">Senha: Skip@Pass</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-blue-400 font-bold mb-1">🩺 Profissional / Fisio</div>
                <div className="text-slate-200">prof.marcos@academia.com</div>
                <div className="text-slate-400">Senha: Skip@Pass</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">🏃 Aluno c/ Contrato</div>
                <div className="text-slate-200">aluno.demo@academia.com</div>
                <div className="text-slate-400">Senha: Skip@Pass</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/90 py-8 px-4 sm:px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NoWaitFitLogo size="sm" />
            <span>— Agendamento Inteligente & Capacidade Real</span>
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
