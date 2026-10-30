import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Activity,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  Mail,
  Lock,
  Loader2,
  KeyRound,
} from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const isAdminHint = searchParams.get('admin') === '1'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha seu e-mail e senha.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      await refreshUser()
      toast({
        title: 'Bem-vindo(a)!',
        description: 'Autenticação realizada com sucesso via token seguro.',
      })

      // Checa perfis do usuário no banco para redirecionamento correto
      let isEmpresa = isAdminHint || email.includes('admin') || email === 'luciomar.fs@gmail.com'
      try {
        const acessoRecs = await pb.collection('acesso').getList(1, 1, {
          filter: `id_usuario = "${authData.record.id}"`,
        })
        if (acessoRecs.items.length > 0) {
          const raw = acessoRecs.items[0].perfis
          let perfisArray: string[] = []
          if (Array.isArray(raw)) perfisArray = raw
          else if (typeof raw === 'string') {
            try {
              perfisArray = JSON.parse(raw)
            } catch {
              perfisArray = [raw]
            }
          }
          if (
            perfisArray.includes('admin') ||
            perfisArray.includes('gestor') ||
            perfisArray.includes('profissional')
          ) {
            isEmpresa = true
          }
        }
      } catch {
        // fallback mantém lógica de isAdminHint
      }

      if (isEmpresa) {
        navigate('/admin')
      } else {
        navigate('/agendar')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação'
      toast({
        title: 'Erro ao autenticar',
        description: msg.includes('Failed to authenticate')
          ? 'E-mail ou senha incorretos. Verifique suas credenciais.'
          : msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (userEmail: string) => {
    setEmail(userEmail)
    setPassword('Skip@Pass')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-cyan-500/15 rounded-full blur-[130px]" />
      </div>

      <header className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Início
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 h-8 w-8"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-xl relative z-10 rounded-3xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            {isAdminHint ? 'Painel Corporativo' : 'Acesse sua Conta'}
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs sm:text-sm">
            {isAdminHint
              ? 'Área restrita de gestão de academias, slots e contratos'
              : 'Entre para consultar vagas, agendar e gerenciar seus horários'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-slate-300 font-medium">
                E-mail Cadastrado
              </Label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 focus:ring-cyan-500/20 text-white rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs text-slate-300 font-medium">
                  Senha
                </Label>
                <Link
                  to="/esqueci-senha"
                  className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 focus:ring-cyan-500/20 text-white rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 h-10 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Validando Tokens...
                </>
              ) : (
                'Entrar na Plataforma'
              )}
            </Button>
          </form>

          {/* Atalhos Rápidos para Demonstração */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Preenchimento Rápido Demo:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('luciomar.fs@gmail.com')}
                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 text-left text-slate-300 transition-colors"
              >
                <div className="font-semibold text-cyan-400">Admin Geral</div>
                <div className="text-[10px] text-slate-500 truncate">luciomar.fs@gmail.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('aluno.demo@academia.com')}
                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 text-left text-slate-300 transition-colors"
              >
                <div className="font-semibold text-blue-400">Aluno Demo</div>
                <div className="text-[10px] text-slate-500 truncate">aluno.demo@academia.com</div>
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0 pb-6 text-center text-xs text-slate-400">
          <div>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="text-cyan-400 font-semibold hover:underline">
              Cadastre-se com ativação por e-mail
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
