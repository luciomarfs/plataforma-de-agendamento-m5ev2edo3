import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
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
import { Activity, ArrowLeft, Sun, Moon, Mail, CheckCircle2, Loader2, KeyRound } from 'lucide-react'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: 'Informe o e-mail',
        description: 'Digite o e-mail da sua conta.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await pb.collection('users').requestPasswordReset(email)
      setEnviado(true)
      toast({
        title: 'E-mail de recuperação enviado!',
        description: 'Verifique sua caixa de entrada e spam para redefinir a senha.',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao solicitar redefinição'
      toast({
        title: 'Falha no envio',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-cyan-500 selection:text-white">
      <header className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Login
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
        <CardHeader className="text-center pb-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Esqueceu a Senha?
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs sm:text-sm">
            Informe seu e-mail para receber as instruções de redefinição
          </CardDescription>
        </CardHeader>

        <CardContent>
          {enviado ? (
            <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Procedimento Enviado!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As instruções de recuperação de senha foram enviadas para:{' '}
                <strong className="text-cyan-400">{email}</strong>.
              </p>
              <p className="text-xs text-slate-400">
                Abra o link recebido no e-mail para definir uma nova senha de acesso.
              </p>
              <Button
                asChild
                className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs sm:text-sm h-9"
              >
                <Link to="/login">Voltar para o Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300 font-medium">
                  E-mail da sua conta
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 text-white rounded-xl text-sm"
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
                    Enviando e-mail...
                  </>
                ) : (
                  'Enviar Procedimento por E-mail'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-0 pb-6 text-xs text-slate-400">
          <Link to="/login" className="text-cyan-400 hover:underline">
            Lembrou da senha? Entrar agora
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
