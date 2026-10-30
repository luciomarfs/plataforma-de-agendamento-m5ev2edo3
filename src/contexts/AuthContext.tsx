import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { User, Acesso } from '@/types/schema'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  perfis: string[]
  isAdmin: boolean
  isGestor: boolean
  isProfissional: boolean
  isUsuario: boolean
  loading: boolean
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return (pb.authStore.record as unknown as User) || null
  })
  const [token, setToken] = useState<string | null>(pb.authStore.token || null)
  const [perfis, setPerfis] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadUserPerfis = useCallback(async (userId: string) => {
    try {
      const records = await pb.collection('acesso').getList<Acesso>(1, 1, {
        filter: `id_usuario = "${userId}"`,
      })
      if (records.items.length > 0) {
        let p = records.items[0].perfis
        if (typeof p === 'string') {
          try {
            p = JSON.parse(p)
          } catch {
            p = [p]
          }
        }
        setPerfis(Array.isArray(p) ? p : [])
      } else {
        setPerfis(['usuario'])
      }
    } catch {
      setPerfis(['usuario'])
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (pb.authStore.isValid && pb.authStore.record) {
      try {
        const refreshed = await pb.collection('users').getOne<User>(pb.authStore.record.id)
        setUser(refreshed)
        setToken(pb.authStore.token)
        await loadUserPerfis(refreshed.id)
      } catch {
        setUser((pb.authStore.record as unknown as User) || null)
        setToken(pb.authStore.token)
        if (pb.authStore.record?.id) {
          await loadUserPerfis(pb.authStore.record.id)
        }
      }
    } else {
      setUser(null)
      setToken(null)
      setPerfis([])
    }
  }, [loadUserPerfis])

  useEffect(() => {
    const unsub = pb.authStore.onChange(async (_token, model) => {
      setUser((model as unknown as User) || null)
      setToken(_token)
      if (model?.id) {
        await loadUserPerfis(model.id)
      } else {
        setPerfis([])
      }
    })

    const init = async () => {
      setLoading(true)
      if (pb.authStore.isValid && pb.authStore.record?.id) {
        await refreshUser()
      }
      setLoading(false)
    }

    init()

    return () => {
      unsub()
    }
  }, [loadUserPerfis, refreshUser])

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
    setPerfis([])
  }

  const isAdmin = perfis.includes('admin')
  const isGestor = perfis.includes('gestor') || isAdmin
  const isProfissional = perfis.includes('profissional') || isAdmin
  const isUsuario = perfis.includes('usuario') || perfis.length === 0

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        perfis,
        isAdmin,
        isGestor,
        isProfissional,
        isUsuario,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
