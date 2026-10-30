import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { User, UserRole } from '@/domain/models'
import { userService } from '@/services/userService'

interface AuthContextType {
  user: User | null
  perfis: UserRole[]
  token: string | null
  isAdmin: boolean
  isProfissional: boolean
  loading: boolean
  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string,
  ) => Promise<{ error: any; user?: any; verificationSent?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  requestPasswordReset: (email: string) => Promise<{ error: any }>
  confirmPasswordReset: (token: string, password: string) => Promise<{ error: any }>
  confirmVerification: (token: string) => Promise<{ error: any }>
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ error: any }>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [perfis, setPerfis] = useState<UserRole[]>([])
  const [token, setToken] = useState<string | null>(pb.authStore.token || null)
  const [loading, setLoading] = useState(true)

  const fetchPerfis = async (userId: string) => {
    try {
      const acesso = await userService.getAcessoByUserId(userId)
      if (acesso && Array.isArray(acesso.perfis)) {
        setPerfis(acesso.perfis)
      } else {
        setPerfis(['usuario'])
      }
    } catch {
      setPerfis(['usuario'])
    }
  }

  const syncAuth = async () => {
    if (pb.authStore.isValid && pb.authStore.record) {
      const u = pb.authStore.record as unknown as User
      setUser(u)
      setToken(pb.authStore.token)
      await fetchPerfis(u.id)
    } else {
      setUser(null)
      setPerfis([])
      setToken(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    syncAuth()
    const unsubscribe = pb.authStore.onChange(async () => {
      await syncAuth()
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const record = await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name,
        phone: phone || '',
      })

      // Vincula perfil inicial 'usuario' na tabela acesso
      try {
        await pb.collection('acesso').create({
          id_usuario: record.id,
          perfis: JSON.stringify(['usuario']),
        })
      } catch (err) {
        console.warn('Erro ao criar acesso inicial:', err)
      }

      // Envia email de ativação (se SMTP falhar ou estiver em demo, captura sem travar)
      let verificationSent = false
      try {
        await pb.collection('users').requestVerification(email)
        verificationSent = true
      } catch (mailErr) {
        console.warn('Serviço de envio de email não configurado ou indisponível:', mailErr)
      }

      return { error: null, user: record, verificationSent }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      await syncAuth()
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    setUser(null)
    setPerfis([])
    setToken(null)
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const confirmPasswordReset = async (resetToken: string, password: string) => {
    try {
      await pb.collection('users').confirmPasswordReset(resetToken, password, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const confirmVerification = async (verifyToken: string) => {
    try {
      await pb.collection('users').confirmVerification(verifyToken)
      if (user) {
        await syncAuth()
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return { error: new Error('Não autenticado') }
    try {
      await pb.collection('users').update(user.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      })
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const refreshAuth = async () => {
    try {
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh()
        await syncAuth()
      }
    } catch {
      signOut()
    }
  }

  const isAdmin = perfis.includes('admin') || perfis.includes('gestor')
  const isProfissional = perfis.includes('profissional') || isAdmin

  return (
    <AuthContext.Provider
      value={{
        user,
        perfis,
        token,
        isAdmin,
        isProfissional,
        loading,
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        confirmPasswordReset,
        confirmVerification,
        updatePassword,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
