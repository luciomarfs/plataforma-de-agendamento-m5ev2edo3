import React, { useState, useEffect } from 'react'
import { apiRequest, getToken, setToken, removeToken, User } from './services/api'
import {
  Building2,
  Calendar,
  Users,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export function App() {
  const [token, setAuthToken] = useState<string | null>(getToken())
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<
    'dashboard' | 'organizacoes' | 'profissionais' | 'slots' | 'contratos'
  >('dashboard')

  // Formulário Login
  const [loginEmail, setLoginEmail] = useState('admin@biofit.com.br')
  const [loginPassword, setLoginPassword] = useState('12345678')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  // Estados dos recursos
  const [metricas, setMetricas] = useState<any>(null)
  const [organizacoes, setOrganizacoes] = useState<any[]>([])
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [slots, setSlots] = useState<any[]>([])
  const [contratos, setContratos] = useState<any[]>([])
  const [msgFeedback, setMsgFeedback] = useState<{
    tipo: 'sucesso' | 'erro'
    texto: string
  } | null>(null)

  // Formulário Nova Organização
  const [novaOrg, setNovaOrg] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    telefone: '',
    endereco: '',
  })
  // Formulário Novo Slot
  const [novoSlot, setNovoSlot] = useState({
    id_organizacao: '',
    data: new Date().toISOString().split('T')[0],
    inicio: '10:00:00',
    fim: '11:00:00',
    recurso: 'Musculação / Fisioterapia',
    quantidade: 5,
  })

  useEffect(() => {
    if (token) {
      carregarPerfil()
    }
  }, [token])

  useEffect(() => {
    if (user) {
      carregarDados()
    }
  }, [user, tab])

  async function carregarPerfil() {
    try {
      const data = await apiRequest('/auth/me')
      setUser(data)
    } catch {
      handleLogout()
    }
  }

  async function carregarDados() {
    setLoading(true)
    try {
      if (tab === 'dashboard') {
        const m = await apiRequest('/dashboard/metricas')
        setMetricas(m)
      } else if (tab === 'organizacoes') {
        const orgs = await apiRequest('/organizacoes')
        setOrganizacoes(orgs)
      } else if (tab === 'profissionais') {
        const profs = await apiRequest('/profissionais')
        setProfissionais(profs)
      } else if (tab === 'slots') {
        const sl = await apiRequest('/slots?apenasAtivos=false')
        setSlots(sl)
        const orgs = await apiRequest('/organizacoes')
        setOrganizacoes(orgs)
        if (orgs.length > 0 && !novoSlot.id_organizacao) {
          setNovoSlot((prev) => ({ ...prev, id_organizacao: orgs[0].id_organizacao }))
        }
      } else if (tab === 'contratos') {
        const cont = await apiRequest('/contratos')
        setContratos(cont)
      }
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    } finally {
      setLoading(false)
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
      setMsgFeedback({ tipo: 'sucesso', texto: `Bem-vindo, ${res.user.name}!` })
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

  async function handleCriarOrg(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiRequest('/organizacoes', {
        method: 'POST',
        body: JSON.stringify(novaOrg),
      })
      setMsgFeedback({ tipo: 'sucesso', texto: 'Organização cadastrada com sucesso!' })
      setNovaOrg({ codigo: '', nome: '', descricao: '', telefone: '', endereco: '' })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function handleCriarSlot(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiRequest('/slots', {
        method: 'POST',
        body: JSON.stringify(novoSlot),
      })
      setMsgFeedback({ tipo: 'sucesso', texto: 'Horário / Slot criado com sucesso na agenda!' })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function handleExcluirSlot(id: string) {
    if (!confirm('Deseja excluir este horário da agenda?')) return
    try {
      await apiRequest(`/slots/${id}`, { method: 'DELETE' })
      setMsgFeedback({ tipo: 'sucesso', texto: 'Slot removido.' })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  // TELA DE LOGIN
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Painel Empresa & Gestão</h1>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-mail corporativo / Admin
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Acessar Painel da Empresa'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Contas de demonstração (seed):</p>
            <p>
              Admin: <code className="text-blue-400">admin@biofit.com.br</code> (senha: 12345678)
            </p>
            <p>
              Profissional: <code className="text-blue-400">carlos.fisioterapia@biofit.com.br</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // TELA PRINCIPAL (DASHBOARD EMPRESA)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Topbar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-slate-100 tracking-tight">Plataforma Empresa</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            SaveinCloud API
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-400">
              {user.email} ({user.perfis.join(', ')})
            </p>
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

      {/* Feedback banner */}
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

      {/* Conteúdo com Sidebar */}
      <div className="flex-1 flex">
        <aside className="w-64 border-r border-slate-800 p-4 space-y-2 bg-slate-900/20">
          <button
            onClick={() => setTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition ${
              tab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Métricas</span>
          </button>
          <button
            onClick={() => setTab('organizacoes')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition ${
              tab === 'organizacoes'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organizações / Unidades</span>
          </button>
          <button
            onClick={() => setTab('profissionais')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition ${
              tab === 'profissionais'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Profissionais & Equipe</span>
          </button>
          <button
            onClick={() => setTab('slots')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition ${
              tab === 'slots'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Slots & Agenda</span>
          </button>
          <button
            onClick={() => setTab('contratos')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition ${
              tab === 'contratos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Contratos & Planos</span>
          </button>
        </aside>

        {/* Painel Central */}
        <main className="flex-1 p-6 overflow-y-auto">
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Visão Geral da Operação</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <p className="text-xs text-slate-400">Unidades Ativas</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">
                    {metricas?.orgsCount ?? '-'}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <p className="text-xs text-slate-400">Horários Cadastrados</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-2">
                    {metricas?.slotsCount ?? '-'}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <p className="text-xs text-slate-400">Contratos / Alunos Vinculados</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">
                    {metricas?.contratosCount ?? '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'organizacoes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Organizações e Unidades</h2>
              </div>

              {/* Formulário nova org */}
              <form
                onSubmit={handleCriarOrg}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <input
                  placeholder="Código (ex: BIO01)"
                  value={novaOrg.codigo}
                  onChange={(e) => setNovaOrg({ ...novaOrg, codigo: e.target.value })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                  required
                />
                <input
                  placeholder="Nome da Unidade"
                  value={novaOrg.nome}
                  onChange={(e) => setNovaOrg({ ...novaOrg, nome: e.target.value })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                  required
                />
                <input
                  placeholder="Telefone"
                  value={novaOrg.telefone}
                  onChange={(e) => setNovaOrg({ ...novaOrg, telefone: e.target.value })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                />
                <input
                  placeholder="Endereço Completo"
                  value={novaOrg.endereco}
                  onChange={(e) => setNovaOrg({ ...novaOrg, endereco: e.target.value })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm md:col-span-2"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Organização</span>
                </button>
              </form>

              {/* Lista */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizacoes.map((org) => (
                  <div
                    key={org.id_organizacao}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-100">{org.nome}</h3>
                        <p className="text-xs text-blue-400 font-mono mt-0.5">{org.codigo}</p>
                      </div>
                    </div>
                    {org.endereco && <p className="text-xs text-slate-400 mt-2">{org.endereco}</p>}
                    {org.telefone && <p className="text-xs text-slate-500 mt-1">{org.telefone}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'profissionais' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Profissionais da Saúde e Equipe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profissionais.map((prof) => (
                  <div
                    key={prof.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      {prof.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">{prof.name}</h3>
                      <p className="text-xs text-slate-400">{prof.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'slots' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Gerenciador de Slots / Grade da Agenda</h2>

              {/* Formulário Novo Slot */}
              <form
                onSubmit={handleCriarSlot}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3"
              >
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Unidade</label>
                  <select
                    value={novoSlot.id_organizacao}
                    onChange={(e) => setNovoSlot({ ...novoSlot, id_organizacao: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    required
                  >
                    {organizacoes.map((o) => (
                      <option key={o.id_organizacao} value={o.id_organizacao}>
                        {o.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    value={novoSlot.data}
                    onChange={(e) => setNovoSlot({ ...novoSlot, data: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Início</label>
                  <input
                    type="text"
                    value={novoSlot.inicio}
                    onChange={(e) => setNovoSlot({ ...novoSlot, inicio: e.target.value })}
                    placeholder="HH:mm:ss"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fim</label>
                  <input
                    type="text"
                    value={novoSlot.fim}
                    onChange={(e) => setNovoSlot({ ...novoSlot, fim: e.target.value })}
                    placeholder="HH:mm:ss"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Vagas</label>
                  <input
                    type="number"
                    min="1"
                    value={novoSlot.quantidade}
                    onChange={(e) =>
                      setNovoSlot({ ...novoSlot, quantidade: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs text-slate-400 mb-1">Recurso / Modalidade</label>
                  <input
                    type="text"
                    value={novoSlot.recurso}
                    onChange={(e) => setNovoSlot({ ...novoSlot, recurso: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                  >
                    Criar Slot
                  </button>
                </div>
              </form>

              {/* Grade de Slots */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slots.map((s) => (
                  <div
                    key={s.id_slot}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {s.data}
                        </span>
                        <button
                          onClick={() => handleExcluirSlot(s.id_slot)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-semibold text-slate-100 mt-2">{s.recurso}</h4>
                      <p className="text-sm text-slate-300 font-mono mt-1">
                        {s.inicio} - {s.fim}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Ocupação:</span>
                      <span
                        className={`font-semibold ${s.quantidade_utilizada >= s.quantidade ? 'text-red-400' : 'text-emerald-400'}`}
                      >
                        {s.quantidade_utilizada} / {s.quantidade} vagas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'contratos' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Contratos e Planos de Alunos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contratos.map((c) => (
                  <div
                    key={c.id_contrato}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-100">
                          {c.expand?.id_usuario?.name || 'Aluno'}
                        </h3>
                        <p className="text-xs text-slate-400">{c.plano_nome}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                        Saldo: {c.saldo_slots} slots
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-slate-400 grid grid-cols-2 gap-2">
                      <p>
                        Vigência: {c.data_inicio} até {c.data_fim}
                      </p>
                      <p>Limite/dia: {c.slots_por_dia || 'Sem limite'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
export default App
