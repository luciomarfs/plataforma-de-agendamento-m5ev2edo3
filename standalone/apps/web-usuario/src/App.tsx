import React, { useState, useEffect } from 'react'
import { apiRequest, getToken, setToken, removeToken, User } from './services/api'
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react'

export function App() {
  const [token, setAuthToken] = useState<string | null>(getToken())
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<'agendar' | 'meus'>('agendar')

  // Formulário Login
  const [loginEmail, setLoginEmail] = useState('mariana.silva@gmail.com')
  const [loginPassword, setLoginPassword] = useState('12345678')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  // Dados
  const [organizacoes, setOrganizacoes] = useState<any[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<any[]>([])
  const [meusAgendamentos, setMeusAgendamentos] = useState<any[]>([])
  const [meusContratos, setMeusContratos] = useState<any[]>([])
  const [msgFeedback, setMsgFeedback] = useState<{
    tipo: 'sucesso' | 'erro'
    texto: string
  } | null>(null)

  useEffect(() => {
    if (token) {
      carregarPerfil()
    }
  }, [token])

  useEffect(() => {
    if (user) {
      carregarOrganizacoes()
      carregarMeusContratos()
      carregarMeusAgendamentos()
    }
  }, [user])

  useEffect(() => {
    if (selectedOrgId) {
      carregarSlotsOrg(selectedOrgId)
    }
  }, [selectedOrgId])

  async function carregarPerfil() {
    try {
      const data = await apiRequest('/auth/me')
      setUser(data)
    } catch {
      handleLogout()
    }
  }

  async function carregarOrganizacoes() {
    try {
      const orgs = await apiRequest('/organizacoes')
      setOrganizacoes(orgs)
      if (orgs.length > 0 && !selectedOrgId) {
        setSelectedOrgId(orgs[0].id_organizacao)
      }
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function carregarSlotsOrg(orgId: string) {
    setLoading(true)
    try {
      const data = await apiRequest(`/slots?organizacaoId=${orgId}&apenasAtivos=true`)
      setSlotsDisponiveis(data)
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function carregarMeusContratos() {
    try {
      const data = await apiRequest('/contratos')
      setMeusContratos(data)
    } catch (_) {}
  }

  async function carregarMeusAgendamentos() {
    try {
      const data = await apiRequest('/agendamentos/meus')
      setMeusAgendamentos(data)
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      setToken(res.token)
      setAuthToken(res.token)
      setUser(res.user)
      setMsgFeedback({ tipo: 'sucesso', texto: `Bem-vindo(a), ${res.user.name}!` })
    } catch (err: any) {
      setLoginError(err.message || 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    removeToken()
    setAuthToken(null)
    setUser(null)
  }

  async function handleAgendar(id_slot: string) {
    setLoading(true)
    try {
      await apiRequest('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          id_slot,
          id_organizacao: selectedOrgId,
        }),
      })
      setMsgFeedback({
        tipo: 'sucesso',
        texto: 'Sessão agendada com sucesso! Vaga e saldo confirmados.',
      })
      carregarSlotsOrg(selectedOrgId)
      carregarMeusContratos()
      carregarMeusAgendamentos()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelar(id_agendamento: string) {
    if (!confirm('Deseja realmente cancelar seu agendamento? A vaga e seu saldo serão estornados.'))
      return
    setLoading(true)
    try {
      await apiRequest(`/agendamentos/${id_agendamento}/cancelar`, {
        method: 'POST',
      })
      setMsgFeedback({
        tipo: 'sucesso',
        texto: 'Agendamento cancelado com sucesso. Vaga e saldo estornados.',
      })
      carregarSlotsOrg(selectedOrgId)
      carregarMeusContratos()
      carregarMeusAgendamentos()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    } finally {
      setLoading(false)
    }
  }

  // TELA DE LOGIN
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Portal do Aluno / Paciente</h1>
              <p className="text-xs text-slate-400">VM SaveinCloud (Postgres + Knex)</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-sm rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Seu E-mail</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Acessando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Conta demo do seed com plano ativo:</p>
            <p>
              Aluna: <code className="text-emerald-400">mariana.silva@gmail.com</code> (senha:
              12345678)
            </p>
            <p className="text-slate-500">Possui 10 slots contratados na BioFit Moema.</p>
          </div>
        </div>
      </div>
    )
  }

  const contratoAtivo = meusContratos.find((c) => c.ativo)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Topbar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-slate-100 tracking-tight">Meus Agendamentos</span>
          {contratoAtivo && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Saldo: {contratoAtivo.saldo_slots} sessões
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Banner de Feedback */}
      {msgFeedback && (
        <div
          className={`px-6 py-2.5 text-sm flex items-center justify-between ${
            msgFeedback.tipo === 'sucesso'
              ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
              : 'bg-red-950/80 text-red-300 border-b border-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {msgFeedback.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{msgFeedback.texto}</span>
          </div>
          <button
            onClick={() => setMsgFeedback(null)}
            className="text-xs underline hover:opacity-80"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Navegação de Abas */}
      <div className="border-b border-slate-800 px-6 flex space-x-4 bg-slate-900/30">
        <button
          onClick={() => setTab('agendar')}
          className={`py-3 text-sm font-medium border-b-2 transition ${
            tab === 'agendar'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Agendar Nova Sessão
        </button>
        <button
          onClick={() => setTab('meus')}
          className={`py-3 text-sm font-medium border-b-2 transition ${
            tab === 'meus'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Histórico e Agendados ({meusAgendamentos.filter((a) => a.status === 'agendado').length})
        </button>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {tab === 'agendar' && (
          <div className="space-y-6">
            {/* Seletor de Unidade */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Selecione a Unidade / Academia
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 font-medium min-w-[280px]"
                >
                  {organizacoes.map((org) => (
                    <option key={org.id_organizacao} value={org.id_organizacao}>
                      {org.nome} ({org.codigo})
                    </option>
                  ))}
                </select>
              </div>

              {contratoAtivo && (
                <div className="text-right text-xs text-slate-400">
                  <p className="text-slate-200 font-semibold">{contratoAtivo.plano_nome}</p>
                  <p>Válido até: {contratoAtivo.data_fim}</p>
                </div>
              )}
            </div>

            {/* Lista de Slots Disponíveis */}
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Horários Disponíveis</span>
            </h2>

            {slotsDisponiveis.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                Nenhum horário disponível para agendamento nesta unidade no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slotsDisponiveis.map((slot) => {
                  const vagasRestantes = Math.max(0, slot.quantidade - slot.quantidade_utilizada)
                  const lotado = vagasRestantes <= 0

                  return (
                    <div
                      key={slot.id_slot}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {slot.data}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              lotado
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {lotado ? 'Lotado' : `${vagasRestantes} vagas livres`}
                          </span>
                        </div>

                        <h3 className="font-semibold text-slate-100 text-base mt-2">
                          {slot.recurso}
                        </h3>
                        <p className="text-sm font-mono text-emerald-400 mt-1">
                          {slot.inicio} às {slot.fim}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                          {slot.quantidade_utilizada} de {slot.quantidade} ocupados
                        </span>
                        <button
                          onClick={() => handleAgendar(slot.id_slot)}
                          disabled={lotado || loading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition"
                        >
                          {lotado ? 'Esgotado' : 'Confirmar Agendamento'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'meus' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Histórico de Agendamentos</h2>

            {meusAgendamentos.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                Você ainda não realizou nenhum agendamento.
              </div>
            ) : (
              <div className="space-y-3">
                {meusAgendamentos.map((ag) => (
                  <div
                    key={ag.id_agendamento}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                            ag.status === 'agendado'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {ag.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Data da Sessão:{' '}
                          <strong className="text-slate-200">
                            {ag.expand?.id_slot?.data || '-'}
                          </strong>
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-100 mt-1">
                        {ag.expand?.id_slot?.recurso || 'Sessão'} ({ag.expand?.id_slot?.inicio} -{' '}
                        {ag.expand?.id_slot?.fim})
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ag.expand?.id_organizacao?.nome || 'Unidade'}</span>
                      </p>
                    </div>

                    {ag.status === 'agendado' && (
                      <button
                        onClick={() => handleCancelar(ag.id_agendamento)}
                        disabled={loading}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 rounded-lg text-xs font-medium transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancelar Agendamento</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
export default App
