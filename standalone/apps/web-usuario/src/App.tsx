import React, { useState, useEffect } from 'react'
import {
  authApi,
  organizacoesApi,
  slotsApi,
  agendamentosApi,
  contratosApi,
  getToken,
  setToken,
  removeToken,
  User,
  Organizacao,
  Slot,
  Agendamento,
  Contrato,
} from './services/api'
import { NoWaitFitLogo } from './components/NoWaitFitLogo'
import {
  Calendar,
  Clock,
  MapPin,
  LogOut,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  Send,
  User as UserIcon,
  Ticket,
} from 'lucide-react'

export function App() {
  const [token, setAuthToken] = useState<string | null>(getToken())
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<'agendar' | 'meus' | 'contrato'>('agendar')

  // Formulário Login
  const [loginEmail, setLoginEmail] = useState('mariana.silva@gmail.com')
  const [loginPassword, setLoginPassword] = useState('12345678')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  // Dados da API
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<Slot[]>([])
  const [meusAgendamentos, setMeusAgendamentos] = useState<Agendamento[]>([])
  const [meusContratos, setMeusContratos] = useState<Contrato[]>([])
  const [dataFiltro, setDataFiltro] = useState<string>('')

  // Feedback do sistema
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
      carregarSlotsOrg(selectedOrgId, dataFiltro)
    }
  }, [selectedOrgId, dataFiltro])

  async function carregarPerfil() {
    try {
      const data = await authApi.me()
      setUser(data)
    } catch {
      handleLogout()
    }
  }

  async function carregarOrganizacoes() {
    try {
      const orgs = await organizacoesApi.listar()
      setOrganizacoes(orgs)
      if (orgs.length > 0 && !selectedOrgId) {
        setSelectedOrgId(orgs[0].id_organizacao)
      }
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function carregarSlotsOrg(orgId: string, data?: string) {
    setLoading(true)
    try {
      const dataSlots = await slotsApi.listar({
        organizacaoId: orgId,
        data: data || undefined,
        apenasAtivos: true,
      })
      setSlotsDisponiveis(dataSlots)
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function carregarMeusContratos() {
    try {
      const data = await contratosApi.listar()
      setMeusContratos(data)
    } catch (_) {}
  }

  async function carregarMeusAgendamentos() {
    try {
      const data = await agendamentosApi.meus()
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
      const res = await authApi.login(loginEmail, loginPassword)
      setToken(res.token)
      setAuthToken(res.token)
      setUser(res.user)
      setMsgFeedback({ tipo: 'sucesso', texto: `Bem-vindo(a) à NoWaitFit, ${res.user.name}!` })
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
      await agendamentosApi.criar({
        id_slot,
        id_organizacao: selectedOrgId,
        observacao: 'Agendado via NoWaitFit Web Usuário',
      })
      setMsgFeedback({
        tipo: 'sucesso',
        texto: 'Sessão agendada com sucesso! Vaga e saldo debitados em tempo real.',
      })
      carregarSlotsOrg(selectedOrgId, dataFiltro)
      carregarMeusContratos()
      carregarMeusAgendamentos()
      setTab('meus')
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelar(id_agendamento: string) {
    if (
      !confirm(
        'Deseja realmente cancelar seu agendamento? A vaga e seu saldo de sessão serão devolvidos imediatamente.',
      )
    )
      return
    setLoading(true)
    try {
      await agendamentosApi.cancelar(id_agendamento)
      setMsgFeedback({
        tipo: 'sucesso',
        texto: 'Agendamento cancelado com sucesso. Vaga e saldo estornados.',
      })
      carregarSlotsOrg(selectedOrgId, dataFiltro)
      carregarMeusContratos()
      carregarMeusAgendamentos()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    } finally {
      setLoading(false)
    }
  }

  function abrirWhatsAppConfirmacao(ag: Agendamento) {
    const org = ag.expand?.id_organizacao
    const slot = ag.expand?.id_slot
    const telefoneOrg = org?.telefone?.replace(/\D/g, '') || '5511999999999'
    const texto = encodeURIComponent(
      `Olá! Sou ${user?.name} e confirmo meu agendamento na NoWaitFit:\n` +
        `• Modalidade: ${slot?.recurso || 'Sessão'}\n` +
        `• Data: ${slot?.data || '-'}\n` +
        `• Horário: ${slot?.inicio || '-'} às ${slot?.fim || '-'}\n` +
        `• Unidade: ${org?.nome || 'Unidade'}\n` +
        `Nos vemos em breve!`,
    )
    window.open(`https://wa.me/${telefoneOrg}?text=${texto}`, '_blank')
  }

  // TELA DE LOGIN
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 selection:bg-emerald-500">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center mb-6 text-center">
            <NoWaitFitLogo size="lg" className="mb-2" />
            <h1 className="text-lg font-bold text-slate-200">Portal do Aluno & Paciente</h1>
            <p className="text-xs text-slate-400 mt-1">
              Agendamentos inteligentes de alta precisão
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/70 border border-red-700 text-red-200 text-sm rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Seu E-mail</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Sua Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Acessando NoWaitFit...' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 bg-slate-950/40 -mx-7 -mb-7 p-6 rounded-b-2xl">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Conta demo com contrato e saldo ativo:
            </p>
            <p>
              Aluna: <code className="text-emerald-300 font-mono">mariana.silva@gmail.com</code>{' '}
              (senha: 12345678)
            </p>
            <p className="text-slate-400">
              Possui contrato com 10 slots disponíveis na unidade Moema.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const contratoAtivo = meusContratos.find((c) => c.ativo)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500">
      {/* Topbar */}
      <header className="h-16 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <NoWaitFitLogo size="sm" />
          {contratoAtivo && (
            <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              <Ticket className="w-3.5 h-3.5" />
              <span>{contratoAtivo.saldo_slots} slots restantes</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400 hidden sm:block">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition border border-transparent hover:border-slate-700"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Banner de Feedback */}
      {msgFeedback && (
        <div
          className={`px-6 py-3 text-sm flex items-center justify-between transition-all ${
            msgFeedback.tipo === 'sucesso'
              ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-800'
              : 'bg-red-950/90 text-red-200 border-b border-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {msgFeedback.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
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
      <div className="border-b border-slate-800/80 px-4 sm:px-6 flex space-x-6 bg-slate-900/30">
        <button
          onClick={() => setTab('agendar')}
          className={`py-3.5 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
            tab === 'agendar'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agendar Nova Sessão</span>
        </button>
        <button
          onClick={() => setTab('meus')}
          className={`py-3.5 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
            tab === 'meus'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            Meus Agendamentos ({meusAgendamentos.filter((a) => a.status === 'agendado').length})
          </span>
        </button>
        <button
          onClick={() => setTab('contrato')}
          className={`py-3.5 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
            tab === 'contrato'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Meu Plano & Saldo</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
        {/* ABA 1: AGENDAR */}
        {tab === 'agendar' && (
          <div className="space-y-6">
            {/* Seletor de Unidade e Data */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Unidade / Academia
                  </label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 font-medium"
                  >
                    {organizacoes.map((org) => (
                      <option key={org.id_organizacao} value={org.id_organizacao}>
                        {org.nome} ({org.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-48">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Filtrar Data
                  </label>
                  <input
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>
              </div>

              {contratoAtivo && (
                <div className="text-right text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-emerald-400 font-bold text-sm">{contratoAtivo.plano_nome}</p>
                  <p className="text-slate-300 mt-0.5">
                    Saldo disponível:{' '}
                    <strong className="text-emerald-400 font-mono">
                      {contratoAtivo.saldo_slots} slots
                    </strong>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Vencimento: {contratoAtivo.data_fim}
                  </p>
                </div>
              )}
            </div>

            {/* Lista de Slots Disponíveis */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center space-x-2 text-white">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Horários Disponíveis para Agendamento</span>
              </h2>
              <button
                onClick={() => carregarSlotsOrg(selectedOrgId, dataFiltro)}
                disabled={loading}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-emerald-400 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {slotsDisponiveis.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="font-medium text-slate-300">Nenhum horário disponível encontrado.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Selecione outra unidade ou remova o filtro de data.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slotsDisponiveis.map((slot) => {
                  const vagasRestantes = Math.max(0, slot.quantidade - slot.quantidade_utilizada)
                  const lotado = vagasRestantes <= 0

                  return (
                    <div
                      key={slot.id_slot}
                      className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition group"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            📅 {slot.data}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              lotado
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {lotado ? 'Esgotado' : `${vagasRestantes} vagas livres`}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-base mt-3">{slot.recurso}</h3>
                        <p className="text-sm font-mono text-emerald-300 mt-1">
                          ⏰ {slot.inicio} às {slot.fim}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-800/80 flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                          {slot.quantidade_utilizada} de {slot.quantidade} ocupados
                        </span>
                        <button
                          onClick={() => handleAgendar(slot.id_slot)}
                          disabled={lotado || loading}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:hover:from-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 transition"
                        >
                          {lotado ? 'Lotado' : 'Agendar Sessão'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA 2: MEUS AGENDAMENTOS */}
        {tab === 'meus' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Histórico dos Meus Agendamentos</h2>

            {meusAgendamentos.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="font-medium text-slate-300">Nenhum agendamento ativo.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Volte para a aba &quot;Agendar Nova Sessão&quot; para escolher seu próximo treino.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meusAgendamentos.map((ag) => (
                  <div
                    key={ag.id_agendamento}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            ag.status === 'agendado'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {ag.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Data:{' '}
                          <strong className="text-slate-200">
                            {ag.expand?.id_slot?.data || '-'}
                          </strong>
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base mt-2">
                        {ag.expand?.id_slot?.recurso || 'Sessão'} (
                        {ag.expand?.id_slot?.inicio || '-'} - {ag.expand?.id_slot?.fim || '-'})
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{ag.expand?.id_organizacao?.nome || 'Unidade NoWaitFit'}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 self-start md:self-auto">
                      <button
                        onClick={() => abrirWhatsAppConfirmacao(ag)}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-semibold transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {ag.status === 'agendado' && (
                        <button
                          onClick={() => handleCancelar(ag.id_agendamento)}
                          disabled={loading}
                          className="flex items-center space-x-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 rounded-xl text-xs font-semibold transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: CONTRATO / SALDO */}
        {tab === 'contrato' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Meus Planos & Saldo de Sessões</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {meusContratos.map((c) => (
                <div
                  key={c.id_contrato}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white text-lg">{c.plano_nome}</h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          c.ativo
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <p className="text-xs text-slate-400">Saldo Atual para Uso</p>
                      <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                        {c.saldo_slots} slots
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
                    <p>
                      📅 Vigência: {c.data_inicio} até {c.data_fim}
                    </p>
                    <p>🎯 Limite diário: {c.slots_por_dia || 'Sem restrição'}</p>
                    <p>🎯 Limite semanal: {c.slots_por_semana || 'Sem restrição'}</p>
                    <p>🎯 Limite mensal: {c.slots_por_mes || 'Sem restrição'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
export default App
