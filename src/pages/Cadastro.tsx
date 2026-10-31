import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { NoWaitFitLogo } from '@/components/NoWaitFitLogo'
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
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

export default function Cadastro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve conter no mínimo 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (password !== passwordConfirm) {
      toast({
        title: 'Senhas divergentes',
        description: 'A confirmação de senha não coincide com a senha digitada.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // 1. Criar usuário com emailVisibility ativado
      const newUser = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name,
        phone,
        emailVisibility: false,
      })

      // 2. Criar registro de acesso com perfil padrão 'usuario'
      try {
        await pb.collection('acesso').create({
          id_usuario: newUser.id,
          perfis: ['usuario'],
        })
      } catch (errAcesso) {
        console.warn('Registro de acesso padrão:', errAcesso)
      }

      // 3. Solicitar e-mail de verificação/ativação nativo do PocketBase
      try {
        await pb.collection('users').requestVerification(email)
      } catch (errEmail) {
        console.warn('Envio de email de ativação:', errEmail)
      }

      setSuccessEmail(email)
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Enviamos um link de ativação para a sua caixa de entrada.',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar usuário'
      toast({
        title: 'Não foi possível concluir o cadastro',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-blue-600/15 rounded-full blur-[130px]" />
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
        <CardHeader className="text-center pb-3">
          <div className="flex justify-center mb-3">
            <NoWaitFitLogo size="md" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Criar Nova Conta NoWaitFit
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs sm:text-sm">
            Cadastre-se para agendar horários em academias e estúdios
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successEmail ? (
            <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Verifique seu E-mail!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enviamos o link de ativação da sua conta para:{' '}
                <strong className="text-cyan-400">{successEmail}</strong>.
              </p>
              <p className="text-xs text-slate-400">
                Clique no link recebido para ativar seu acesso e em seguida faça login.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs sm:text-sm h-9"
              >
                Ir para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCadastro} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs text-slate-300 font-medium">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="name"
                    placeholder="Ex: Carlos Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 text-white rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-slate-300 font-medium">
                  Seu E-mail (receberá link de ativação)
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="carlos@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 text-white rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs text-slate-300 font-medium">
                  WhatsApp / Celular
                </Label>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 text-white rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pass" className="text-xs text-slate-300 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <Input
                      id="pass"
                      type="password"
                      placeholder="Mín. 8 dígitos"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 text-white rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="passConf" className="text-xs text-slate-300 font-medium">
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <Input
                      id="passConf"
                      type="password"
                      placeholder="Repita a senha"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="pl-9 bg-slate-950/60 border-slate-700/80 focus:border-cyan-500 text-white rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 h-10 text-sm mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando e enviando e-mail...
                  </>
                ) : (
                  'Cadastrar e Enviar E-mail de Ativação'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0 pb-6 text-center text-xs text-slate-400">
          <div>
            Já tem uma conta?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
              Fazer Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
