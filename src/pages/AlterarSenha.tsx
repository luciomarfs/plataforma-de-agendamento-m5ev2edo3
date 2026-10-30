import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/contexts/AuthContext'
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
import { Lock, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function AlterarSenha() {
  const { user, refreshUser } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const navigate = useNavigate()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (password.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter no mínimo 8 dígitos.',
        variant: 'destructive',
      })
      return
    }

    if (password !== passwordConfirm) {
      toast({
        title: 'Senhas divergentes',
        description: 'A confirmação de senha não confere.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await pb.collection('users').update(user.id, {
        oldPassword,
        password,
        passwordConfirm,
      })
      await refreshUser()
      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Sua nova senha já está valendo para os próximos logins.',
      })
      navigate(-1)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar senha'
      toast({
        title: 'Falha ao alterar senha',
        description: msg.includes('oldPassword') ? 'Senha atual incorreta.' : msg,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-cyan-500 selection:text-white">
      <header className="absolute top-4 left-4 right-4 max-w-4xl mx-auto flex items-center justify-between z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-xs sm:text-sm text-slate-400 hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Voltar
        </Button>
      </header>

      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-xl relative z-10 rounded-3xl">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-3">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-white tracking-tight">
            Alterar Minha Senha
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs sm:text-sm">
            Usuário: <span className="text-cyan-400">{user?.email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Senha Atual</Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-slate-950/60 border-slate-700/80 text-white rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Nova Senha (mín. 8 dígitos)</Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-slate-950/60 border-slate-700/80 text-white rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-slate-950/60 border-slate-700/80 text-white rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-medium shadow-md shadow-cyan-500/20 h-10 text-sm mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                'Salvar Nova Senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
