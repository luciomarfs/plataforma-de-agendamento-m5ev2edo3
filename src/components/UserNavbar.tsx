import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { NoWaitFitLogo } from '@/components/NoWaitFitLogo'
import {
  Activity,
  Calendar,
  Building2,
  KeyRound,
  LogOut,
  Sun,
  Moon,
  Clock,
  Sparkles,
} from 'lucide-react'

export const UserNavbar: React.FC = () => {
  const { user, isAdmin, isGestor, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <NoWaitFitLogo size="sm" />
            <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono uppercase font-bold ml-1">
              Aluno
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/agendar"
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                location.pathname === '/agendar'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vagas & Agendar
            </Link>
            <Link
              to="/meus-agendamentos"
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                location.pathname === '/meus-agendamentos'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meus Agendamentos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Admin Switcher */}
          {(isAdmin || isGestor) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin')}
              className="rounded-full border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-950/60 text-xs h-8 px-3"
            >
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Painel Empresa
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 h-8 w-8"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>

          {/* User actions */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/alterar-senha')}
              title="Alterar Senha"
              className="rounded-full text-slate-400 hover:text-cyan-400 h-8 w-8"
            >
              <KeyRound className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sair"
              className="rounded-full text-slate-400 hover:text-rose-400 h-8 w-8"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
