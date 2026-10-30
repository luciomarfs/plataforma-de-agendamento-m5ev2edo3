import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Calendar,
  Users,
  FileText,
  ListTodo,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  ArrowLeft,
  Activity,
  Layers,
} from 'lucide-react'

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Visão Geral', path: '/admin', icon: Activity },
    { label: 'Academias & Orgs', path: '/admin/organizacoes', icon: Building2 },
    { label: 'Profissionais & Vínculos', path: '/admin/profissionais', icon: Users },
    { label: 'Preencher Agenda (Slots)', path: '/admin/slots', icon: Calendar },
    { label: 'Contratos de Alunos', path: '/admin/contratos', icon: FileText },
    { label: 'Backlog do Produto', path: '/admin/backlog', icon: ListTodo },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                  AgendFit Enterprise
                </span>
                <span className="text-[10px] text-cyan-400 -mt-1 font-mono uppercase">
                  Gestão & Slots
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-block h-4 w-px bg-slate-800 ml-2" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/agendar')}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full text-xs text-slate-400 hover:text-cyan-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ver Portal do Usuário
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 h-8 w-8"
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="hidden sm:inline-block text-xs text-slate-400 truncate max-w-[140px]">
                {user?.name || user?.email}
              </span>
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

        {/* Navigation Pills Bar */}
        <div className="border-t border-slate-800/60 bg-slate-950/60 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
