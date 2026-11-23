import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { NoWaitFitLogo } from '@/components/NoWaitFitLogo'
import {
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Activity,
  Smartphone,
  Flame,
  Zap,
  Mail,
} from 'lucide-react'

export default function Index() {
  const { isAuthenticated, isAdmin, isGestor, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Background: halos suaves e discretos (ciano/azul), sem saturação forte */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-sky-500/[0.07] to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[25%] -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-blue-500/[0.08] via-indigo-500/[0.06] to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[45%] -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-sky-500/[0.07] via-blue-500/[0.05] to-transparent rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-1/4 w-[700px] h-[500px] bg-cyan-700/[0.07] rounded-full blur-[160px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <NoWaitFitLogo size="sm" />
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/60 font-mono font-bold tracking-wider uppercase ml-1">
              Smart Agenda
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-slate-800 bg-slate-900/70 hover:bg-slate-800 hover:text-cyan-300 text-slate-400 transition-colors h-9 w-9 shadow-sm"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin || isGestor ? (
                  <Button
                    onClick={() => navigate('/admin')}
                    className="rounded-full bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 hover:border-cyan-500/40 text-cyan-300 font-semibold px-4 h-9 text-xs sm:text-sm transition-colors"
                  >
                    Painel da Empresa
                  </Button>
                ) : null}
                <Button
                  onClick={() => navigate('/agendar')}
                  className="rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 h-9 text-xs sm:text-sm shadow-sm shadow-cyan-950/40"
                >
                  Minha Agenda
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-900 h-9 px-3 text-xs"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="rounded-full text-slate-300 hover:text-white hover:bg-slate-900/80 px-4 h-9 text-xs sm:text-sm font-semibold"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate('/cadastro')}
                  className="rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-950/40 px-5 h-9 text-xs sm:text-sm font-semibold transition-colors"
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
            <NoWaitFitLogo size="lg" />
          </div>

          {/* Pill discreta */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Zero Filas • Alta Precisão • Capacidade por Sessão</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.12]">
            Agendamentos Inteligentes para{' '}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              Academias, Fisioterapia & Studios
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed font-light">
            Elimine filas e ociosidade de equipamentos. Controle de capacidade em tempo real, gestão
            de múltiplos profissionais, contratos com saldo de slots e confirmação instantânea via
            WhatsApp.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/agendar' : '/login')}
              className="rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-950/50 px-8 h-12 text-base transition-colors"
            >
              {isAuthenticated ? 'Acessar Meus Agendamentos' : 'Agendar Horário Agora'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login?admin=1')}
              className="rounded-full border-slate-800 bg-slate-900/60 hover:bg-slate-800/70 hover:text-white text-slate-300 px-7 h-12 text-base backdrop-blur-sm transition-colors"
            >
              <Building2 className="h-4 w-4 mr-2 text-slate-400" />
              Painel Empresa / Admin
            </Button>
          </div>

          {/* Quick Stats Pills — discretas, acento único ciano */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-left hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-cyan-300">100% Real</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">Vagas por sessão sem superlotação</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-left hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-cyan-300">Multi-Org</span>
                <Building2 className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Várias unidades e filiais integradas
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-left hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-cyan-300">Contratos</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">Controle de saldo e cotas de uso</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-left hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-cyan-300">WhatsApp</span>
                <Activity className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">Confirmação instantânea no celular</div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/60">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Dois Frontends Dedicados na Mesma Plataforma
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Desenvolvidos para velocidade máxima tanto para alunos quanto para equipes de gestão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Usuário */}
            <div className="relative p-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm shadow-lg hover:border-cyan-500/30 transition-colors group">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Portal do Aluno NoWaitFit</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Interface mobile-first rápida e objetiva. O aluno pesquisa as unidades disponíveis,
                confere vagas em tempo real por horário e realiza o agendamento com um clique.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0" />
                  Visualização de vagas restantes (ex: 3 de 5 disponíveis)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0" />
                  Cancelamento com estorno automático de vaga e saldo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0" />
                  Botão de WhatsApp para confirmação direta com o estúdio
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0" />
                  Saldo de slots atualizado instantaneamente conforme seu plano
                </li>
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/agendar')}
                  className="rounded-full w-full bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-semibold transition-colors"
                >
                  Explorar Vagas Disponíveis
                </Button>
              </div>
            </div>

            {/* Card Empresa */}
            <div className="relative p-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm shadow-lg hover:border-cyan-500/30 transition-colors group">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Painel Corporativo NoWaitFit</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Controle operacional completo para gestores de academias e estúdios. Gestão de
                múltiplas unidades, criação de slots individuais ou em lote e monitoramento de
                contratos.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                  Grade de slots com capacidade configurável e geração em lote
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                  Cadastro de profissionais atuando em várias unidades
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                  Gestão completa de contratos de alunos com cotas diárias/semanais/mensais
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                  Métricas em tempo real integradas com PostgreSQL/PocketBase
                </li>
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/admin')}
                  className="rounded-full w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-sm shadow-cyan-950/40"
                >
                  Acessar Painel Corporativo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Informações de Demonstração */}
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
            <h4 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
              Acesso Rápido de Demonstração
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Cadastre-se com seu e-mail para receber link de ativação ou use as credenciais de
              teste:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-amber-300 font-bold mb-1">👑 Administrador</div>
                <div className="text-slate-300">luciomar.fs@gmail.com</div>
                <div className="text-slate-500">Senha: Skip@Pass</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-sky-300 font-bold mb-1">🩺 Profissional / Fisio</div>
                <div className="text-slate-300">prof.marcos@academia.com</div>
                <div className="text-slate-500">Senha: Skip@Pass</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-200 font-bold mb-1">🏃 Aluno c/ Contrato</div>
                <div className="text-slate-300">aluno.demo@academia.com</div>
                <div className="text-slate-500">Senha: Skip@Pass</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Marca + descrição */}
            <div className="sm:col-span-2">
              <NoWaitFitLogo size="md" />
              <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-sm">
                Agendamentos inteligentes para academias, fisioterapia e studios — zero filas,
                capacidade real por sessão e confirmação instantânea.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                  <Zap className="h-3 w-3 text-amber-400" />
                  Zero Filas
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-cyan-400" />
                  Capacidade Real
                </span>
              </div>
            </div>

            {/* Navegação */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Navegação
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-300 transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-cyan-500/70" />
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cadastro"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-300 transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-cyan-500/70" />
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <Link
                    to="/agendar"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-300 transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-cyan-500/70" />
                    Agendar Horários
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-300 transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-violet-500/70" />
                    Painel Corporativo
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Contato
              </h4>
              <a
                href="mailto:contato@nowaitfit.com.br"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                contato@nowaitfit.com.br
              </a>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                Suporte para alunos e para equipes de gestão de academias, fisioterapia e studios.
              </p>
            </div>
          </div>

          {/* Linha final: direitos reservados */}
          <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} NoWaitFit. Todos os direitos reservados.</span>
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-sky-400" />
              Agendamento Inteligente &amp; Capacidade Real
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
