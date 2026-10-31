import React, { useState, useEffect } from 'react'
import {
  authApi,
  organizacoesApi,
  profissionaisApi,
  slotsApi,
  contratosApi,
  dashboardApi,
  getToken,
  setToken,
  removeToken,
  User,
  Organizacao,
  Slot,
  Contrato,
  DashboardMetricas,
} from './services/api'
import { NoWaitFitLogo } from './components/NoWaitFitLogo'
import {
  Building2,
  Calendar,
  Users,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Layers,
  Link as LinkIcon,
  Unlink,
  RefreshCw,
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
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null)
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [profissionais, setProfissionais] = useState<User[]>([])
  const [todosUsuarios, setTodosUsuarios] = useState<User[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [msgFeedback, setMsgFeedback] = useState<{
    tipo: 'sucesso' | 'erro'
    texto: string
  } | null>(null)

  // Modais de Criação e Edição
  const [modalOrg, setModalOrg] = useState<{ aberto: boolean; editandoId?: string }>({
    aberto: false,
  })
  const [formOrg, setFormOrg] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    telefone: '',
    endereco: '',
  })

  const [modalProf, setModalProf] = useState<{ aberto: boolean; editandoUser?: User }>({
    aberto: false,
  })
  const [formProf, setFormProf] = useState({
    name: '',
    email: '',
    perfis: ['profissional'] as string[],
  })

  const [modalVinculo, setModalVinculo] = useState(false)
  const [formVinculo, setFormVinculo] = useState({
    id_usuario: '',
    id_organizacao: '',
    papel: 'profissional' as 'admin' | 'gestor' | 'profissional' | 'aluno',
  })

  const [modalSlot, setModalSlot] = useState<{ aberto: boolean; editandoId?: string }>({
    aberto: false,
  })
  const [formSlot, setFormSlot] = useState({
    id_organizacao: '',
    id_profissional: '',
    data: new Date().toISOString().split('T')[0],
    inicio: '08:00:00',
    fim: '09:00:00',
    recurso: 'Musculação / Fisioterapia',
    quantidade: 5,
    ativo: true,
  })

  // Modal Geração em Lote de Slots
  const [modalLote, setModalLote] = useState(false)
  const [formLote, setFormLote] = useState({
    id_organizacao: '',
    data: new Date().toISOString().split('T')[0],
    horaInicio: 8,
    horaFim: 18,
    duracaoMin: 60,
    recurso: 'Atendimento Personalizado',
    quantidade: 5,
  })

  const [modalContrato, setModalContrato] = useState<{ aberto: boolean; editandoId?: string }>({
    aberto: false,
  })
  const [formContrato, setFormContrato] = useState({
    id_usuario: '',
    id_organizacao: '',
    plano_nome: 'Plano Silver Premium',
    saldo_slots: 10,
    slots_por_dia: 2,
    slots_por_semana: 6,
    slots_por_mes: 20,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    ativo: true,
  })

  // Filtros
  const [filtroOrg, setFiltroOrg] = useState('')
  const [filtroDataSlot, setFiltroDataSlot] = useState('')

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
      const data = await authApi.me()
      setUser(data)
    } catch {
      handleLogout()
    }
  }

  async function carregarDados() {
    setLoading(true)
    try {
      if (tab === 'dashboard') {
        const m = await dashboardApi.metricas()
        setMetricas(m)
      } else if (tab === 'organizacoes') {
        const orgs = await organizacoesApi.listar()
        setOrganizacoes(orgs)
      } else if (tab === 'profissionais') {
        const [profs, users, orgs] = await Promise.all([
          profissionaisApi.listarProfissionais(),
          profissionaisApi.listarUsuarios(),
          organizacoesApi.listar(),
        ])
        setProfissionais(profs)
        setTodosUsuarios(users)
        setOrganizacoes(orgs)
        if (users.length > 0 && !formVinculo.id_usuario) {
          setFormVinculo((prev) => ({ ...prev, id_usuario: users[0].id }))
        }
        if (orgs.length > 0 && !formVinculo.id_organizacao) {
          setFormVinculo((prev) => ({ ...prev, id_organizacao: orgs[0].id_organizacao }))
        }
      } else if (tab === 'slots') {
        const [sl, orgs, profs] = await Promise.all([
          slotsApi.listar({
            organizacaoId: filtroOrg || undefined,
            data: filtroDataSlot || undefined,
            apenasAtivos: false,
          }),
          organizacoesApi.listar(),
          profissionaisApi.listarProfissionais(),
        ])
        setSlots(sl)
        setOrganizacoes(orgs)
        setProfissionais(profs)
        if (orgs.length > 0 && !formSlot.id_organizacao) {
          setFormSlot((prev) => ({ ...prev, id_organizacao: orgs[0].id_organizacao }))
        }
        if (orgs.length > 0 && !formLote.id_organizacao) {
          setFormLote((prev) => ({ ...prev, id_organizacao: orgs[0].id_organizacao }))
        }
      } else if (tab === 'contratos') {
        const [cont, orgs, users] = await Promise.all([
          contratosApi.listar({ id_organizacao: filtroOrg || undefined }),
          organizacoesApi.listar(),
          profissionaisApi.listarUsuarios(),
        ])
        setContratos(cont)
        setOrganizacoes(orgs)
        setTodosUsuarios(users)
        if (users.length > 0 && !formContrato.id_usuario) {
          setFormContrato((prev) => ({ ...prev, id_usuario: users[0].id }))
        }
        if (orgs.length > 0 && !formContrato.id_organizacao) {
          setFormContrato((prev) => ({ ...prev, id_organizacao: orgs[0].id_organizacao }))
        }
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
      const res = await authApi.login(loginEmail, loginPassword)
      setToken(res.token)
      setAuthToken(res.token)
      setUser(res.user)
      setMsgFeedback({ tipo: 'sucesso', texto: `Bem-vindo à NoWaitFit, ${res.user.name}!` })
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

  // --- ORGANIZACOES CRUD ---
  function abrirModalOrg(org?: Organizacao) {
    if (org) {
      setFormOrg({
        codigo: org.codigo,
        nome: org.nome,
        descricao: org.descricao || '',
        telefone: org.telefone || '',
        endereco: org.endereco || '',
      })
      setModalOrg({ aberto: true, editandoId: org.id_organizacao })
    } else {
      setFormOrg({
        codigo: `ORG-${Math.floor(1000 + Math.random() * 9000)}`,
        nome: '',
        descricao: '',
        telefone: '',
        endereco: '',
      })
      setModalOrg({ aberto: true, editandoId: undefined })
    }
  }

  async function salvarOrg(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (modalOrg.editandoId) {
        await organizacoesApi.atualizar(modalOrg.editandoId, formOrg)
        setMsgFeedback({ tipo: 'sucesso', texto: 'Organização atualizada com sucesso!' })
      } else {
        await organizacoesApi.criar(formOrg)
        setMsgFeedback({ tipo: 'sucesso', texto: 'Organização criada com sucesso!' })
      }
      setModalOrg({ aberto: false })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function excluirOrg(id: string) {
    if (!confirm('Deseja realmente remover esta organização?')) return
    try {
      await organizacoesApi.excluir(id)
      setMsgFeedback({ tipo: 'sucesso', texto: 'Organização removida.' })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  // --- PROFISSIONAIS / USUARIOS CRUD ---
  function abrirModalProf(p: User) {
    setFormProf({
      name: p.name,
      email: p.email,
      perfis: p.perfis || ['profissional'],
    })
    setModalProf({ aberto: true, editandoUser: p })
  }

  async function salvarProf(e: React.FormEvent) {
    e.preventDefault()
    if (!modalProf.editandoUser) return
    try {
      await profissionaisApi.atualizar(modalProf.editandoUser.id, {
        name: formProf.name,
        email: formProf.email,
      })
      await profissionaisApi.atualizarPerfis(modalProf.editandoUser.id, formProf.perfis)
      setMsgFeedback({ tipo: 'sucesso', texto: 'Profissional / usuário atualizado!' })
      setModalProf({ aberto: false })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function handleVincular(e: React.FormEvent) {
    e.preventDefault()
    try {
      await profissionaisApi.vincular(formVinculo)
      setMsgFeedback({ tipo: 'sucesso', texto: 'Profissional vinculado à organização!' })
      setModalVinculo(false)
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function handleDesvincular(id_usuario: string, id_organizacao: string) {
    if (!confirm('Deseja desvincular o usuário desta organização?')) return
    try {
      await profissionaisApi.desvincular(id_usuario, id_organizacao)
      setMsgFeedback({ tipo: 'sucesso', texto: 'Vínculo removido.' })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  // --- SLOTS CRUD ---
  function abrirModalSlot(slot?: Slot) {
    if (slot) {
      setFormSlot({
        id_organizacao: slot.id_organizacao,
        id_profissional: slot.id_profissional || '',
        data: slot.data,
        inicio: slot.inicio,
        fim: slot.fim,
        recurso: slot.recurso,
        quantidade: slot.quantidade,
        ativo: slot.ativo ?? true,
      })
      setModalSlot({ aberto: true, editandoId: slot.id_slot })
    } else {
      setFormSlot({
        id_organizacao: organizacoes[0]?.id_organizacao || '',
        id_profissional: '',
        data: new Date().toISOString().split('T')[0],
        inicio: '08:00:00',
        fim: '09:00:00',
        recurso: 'Musculação / Fisioterapia',
        quantidade: 5,
        ativo: true,
      })
      setModalSlot({ aberto: true, editandoId: undefined })
    }
  }

  async function salvarSlot(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        ...formSlot,
        id_profissional: formSlot.id_profissional || null,
        quantidade: Number(formSlot.quantidade),
      }
      if (modalSlot.editandoId) {
        await slotsApi.atualizar(modalSlot.editandoId, payload)
        setMsgFeedback({ tipo: 'sucesso', texto: 'Slot atualizado com sucesso!' })
      } else {
        await slotsApi.criar(payload)
        setMsgFeedback({ tipo: 'sucesso', texto: 'Slot cadastrado na grade de horários!' })
      }
      setModalSlot({ aberto: false })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function handleCriarLote(e: React.FormEvent) {
    e.preventDefault()
    try {
      const slotsParaCriar = []
      const horaIni = Number(formLote.horaInicio)
      const horaFim = Number(formLote.horaFim)

      for (let h = horaIni; h < horaFim; h++) {
        const startH = String(h).padStart(2, '0')
        const endH = String(h + 1).padStart(2, '0')
        slotsParaCriar.push({
          id_organizacao: formLote.id_organizacao,
          id_profissional: null,
          data: formLote.data,
          inicio: `${startH}:00:00`,
          fim: `${endH}:00:00`,
          recurso: formLote.recurso,
          quantidade: Number(formLote.quantidade),
          ativo: true,
        })
      }

      await slotsApi.criarLote(slotsParaCriar)
      setMsgFeedback({
        tipo: 'sucesso',
        texto: `${slotsParaCriar.length} slots gerados em lote para o dia ${formLote.data}!`,
      })
      setModalLote(false)
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function excluirSlot(id: string) {
    if (!confirm('Deseja excluir este horário da agenda?')) return
    try {
      await slotsApi.excluir(id)
      setMsgFeedback({ tipo: 'sucesso', texto: 'Slot removido.' })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  // --- CONTRATOS CRUD ---
  function abrirModalContrato(c?: Contrato) {
    if (c) {
      setFormContrato({
        id_usuario: c.id_usuario,
        id_organizacao: c.id_organizacao,
        plano_nome: c.plano_nome || '',
        saldo_slots: c.saldo_slots,
        slots_por_dia: c.slots_por_dia ?? 0,
        slots_por_semana: c.slots_por_semana ?? 0,
        slots_por_mes: c.slots_por_mes ?? 0,
        data_inicio: c.data_inicio,
        data_fim: c.data_fim,
        ativo: c.ativo,
      })
      setModalContrato({ aberto: true, editandoId: c.id_contrato })
    } else {
      setFormContrato({
        id_usuario: todosUsuarios[0]?.id || '',
        id_organizacao: organizacoes[0]?.id_organizacao || '',
        plano_nome: 'Plano Silver Premium',
        saldo_slots: 10,
        slots_por_dia: 2,
        slots_por_semana: 6,
        slots_por_mes: 20,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        ativo: true,
      })
      setModalContrato({ aberto: true, editandoId: undefined })
    }
  }

  async function salvarContrato(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        ...formContrato,
        saldo_slots: Number(formContrato.saldo_slots),
        slots_por_dia: formContrato.slots_por_dia ? Number(formContrato.slots_por_dia) : null,
        slots_por_semana: formContrato.slots_por_semana
          ? Number(formContrato.slots_por_semana)
          : null,
        slots_por_mes: formContrato.slots_por_mes ? Number(formContrato.slots_por_mes) : null,
      }
      if (modalContrato.editandoId) {
        await contratosApi.atualizar(modalContrato.editandoId, payload)
        setMsgFeedback({ tipo: 'sucesso', texto: 'Contrato atualizado com sucesso!' })
      } else {
        await contratosApi.criar(payload)
        setMsgFeedback({ tipo: 'sucesso', texto: 'Contrato do aluno cadastrado com sucesso!' })
      }
      setModalContrato({ aberto: false })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  async function excluirContrato(id: string) {
    if (!confirm('Deseja excluir este contrato?')) return
    try {
      await contratosApi.excluir(id)
      setMsgFeedback({ tipo: 'sucesso', texto: 'Contrato removido.' })
      carregarDados()
    } catch (err: any) {
      setMsgFeedback({ tipo: 'erro', texto: err.message })
    }
  }

  // TELA DE LOGIN
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 selection:bg-cyan-500">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col items-center mb-6 text-center">
            <NoWaitFitLogo size="lg" className="mb-2" />
            <h1 className="text-lg font-bold text-slate-200">Painel Gestão & Empresa</h1>
            <p className="text-xs text-slate-400 mt-1">
              Plataforma REST Hexagonal (PostgreSQL + Knex)
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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                E-mail corporativo / Admin
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Entrando na NoWaitFit...' : 'Acessar Painel Corporativo'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400 space-y-1.5 bg-slate-950/40 -mx-7 -mb-7 p-6 rounded-b-2xl">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Credenciais demonstrativas da API:
            </p>
            <p>
              Admin: <code className="text-cyan-300">admin@biofit.com.br</code> (senha: 12345678)
            </p>
            <p>
              Fisioterapeuta:{' '}
              <code className="text-cyan-300">carlos.fisioterapia@biofit.com.br</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // TELA PRINCIPAL (DASHBOARD EMPRESA)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500">
      {/* Topbar */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <NoWaitFitLogo size="sm" />
          <span className="hidden sm:inline-block h-4 w-[1px] bg-slate-700" />
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Painel da Empresa
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">
              {user.email} •{' '}
              <span className="text-cyan-400 font-mono capitalize">{user.perfis.join(', ')}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition border border-transparent hover:border-slate-700"
            title="Sair do sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Feedback banner */}
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

      {/* Estrutura com Sidebar */}
      <div className="flex-1 flex">
        <aside className="w-64 border-r border-slate-800/80 p-4 space-y-2 bg-slate-900/30 shrink-0">
          <button
            onClick={() => setTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Métricas</span>
          </button>
          <button
            onClick={() => setTab('organizacoes')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === 'organizacoes'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organizações / Unidades</span>
          </button>
          <button
            onClick={() => setTab('profissionais')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === 'profissionais'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Profissionais & Equipe</span>
          </button>
          <button
            onClick={() => setTab('slots')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === 'slots'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Slots & Agenda</span>
          </button>
          <button
            onClick={() => setTab('contratos')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === 'contratos'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Contratos & Planos</span>
          </button>

          <div className="pt-6 border-t border-slate-800 mt-6">
            <button
              onClick={carregarDados}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizar API</span>
            </button>
          </div>
        </aside>

        {/* Painel Central */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* TAB 1: DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Visão Geral da Operação NoWaitFit
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Métricas em tempo real integradas via API REST e PostgreSQL.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                      Unidades Cadastradas
                    </p>
                    <Building2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-4xl font-extrabold text-white mt-3">
                    {metricas?.orgsCount ?? '-'}
                  </p>
                  <p className="text-xs text-cyan-400 mt-2">Academias e Studios ativos</p>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/40 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                      Horários na Grade
                    </p>
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-4xl font-extrabold text-white mt-3">
                    {metricas?.slotsCount ?? '-'}
                  </p>
                  <p className="text-xs text-blue-400 mt-2">Slots configurados com capacidade</p>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/40 transition">
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                      Contratos de Alunos
                    </p>
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <p className="text-4xl font-extrabold text-white mt-3">
                    {metricas?.contratosCount ?? '-'}
                  </p>
                  <p className="text-xs text-indigo-400 mt-2">Planos com controle de saldo</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORGANIZACOES */}
          {tab === 'organizacoes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Organizações & Unidades
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Crie, altere, consulte e remova unidades da rede NoWaitFit via API.
                  </p>
                </div>
                <button
                  onClick={() => abrirModalOrg()}
                  className="flex items-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20 transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Organização</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {organizacoes.map((org) => (
                  <div
                    key={org.id_organizacao}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                          {org.codigo}
                        </span>
                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => abrirModalOrg(org)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                            title="Editar organização"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => excluirOrg(org.id_organizacao)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                            title="Remover organização"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-white mt-3">{org.nome}</h3>
                      {org.descricao && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          {org.descricao}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                      {org.endereco && <p className="truncate">📍 {org.endereco}</p>}
                      {org.telefone && <p>📞 {org.telefone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROFISSIONAIS */}
          {tab === 'profissionais' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Profissionais & Equipe Técnica
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Gestão de membros da equipe, papéis e vinculação a unidades.
                  </p>
                </div>
                <button
                  onClick={() => setModalVinculo(true)}
                  className="flex items-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20 transition self-start sm:self-auto"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Vincular Profissional à Unidade</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {profissionais.map((prof) => (
                  <div
                    key={prof.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between group transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-cyan-500/20">
                          {prof.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">{prof.name}</h3>
                          <p className="text-xs text-slate-400">{prof.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => abrirModalProf(prof)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                        title="Editar dados e papéis"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {prof.perfis?.map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-cyan-300 capitalize"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SLOTS (AGENDA) */}
          {tab === 'slots' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Grade de Horários & Slots
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Cadastre slots individuais ou crie horários em lote para o dia.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setModalLote(true)}
                    className="flex items-center space-x-1.5 py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium transition"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Gerar em Lote</span>
                  </button>
                  <button
                    onClick={() => abrirModalSlot()}
                    className="flex items-center space-x-1.5 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Slot</span>
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-slate-400 mb-1">Filtrar por Unidade</label>
                  <select
                    value={filtroOrg}
                    onChange={(e) => setFiltroOrg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200"
                  >
                    <option value="">Todas as unidades</option>
                    {organizacoes.map((o) => (
                      <option key={o.id_organizacao} value={o.id_organizacao}>
                        {o.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-slate-400 mb-1">Filtrar por Data</label>
                  <input
                    type="date"
                    value={filtroDataSlot}
                    onChange={(e) => setFiltroDataSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={carregarDados}
                    className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>

              {/* Lista de Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {slots.map((s) => {
                  const lotado = s.quantidade_utilizada >= s.quantidade
                  return (
                    <div
                      key={s.id_slot}
                      className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between group transition"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {s.data}
                          </span>
                          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => abrirModalSlot(s)}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                              title="Editar slot"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => excluirSlot(s.id_slot)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                              title="Remover slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-bold text-white text-base mt-2.5">{s.recurso}</h4>
                        <p className="text-sm font-mono text-cyan-300 mt-1">
                          ⏰ {s.inicio} - {s.fim}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Ocupação / Vagas:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            lotado
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {s.quantidade_utilizada} / {s.quantidade} vagas
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CONTRATOS */}
          {tab === 'contratos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Contratos & Planos de Alunos
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Cadastre, edite saldos e limites de frequência por aluno.
                  </p>
                </div>
                <button
                  onClick={() => abrirModalContrato()}
                  className="flex items-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20 transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Contrato</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {contratos.map((c) => {
                  const alunoNome =
                    c.expand?.id_usuario?.name ||
                    todosUsuarios.find((u) => u.id === c.id_usuario)?.name ||
                    'Aluno'
                  const orgNome =
                    c.expand?.id_organizacao?.nome ||
                    organizacoes.find((o) => o.id_organizacao === c.id_organizacao)?.nome ||
                    'Unidade'

                  return (
                    <div
                      key={c.id_contrato}
                      className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between group transition"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-white text-base">{alunoNome}</h3>
                            <p className="text-xs text-cyan-400 font-semibold">{c.plano_nome}</p>
                            <p className="text-xs text-slate-400 mt-0.5">🏢 {orgNome}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="px-2.5 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                              Saldo: {c.saldo_slots} slots
                            </span>
                            <button
                              onClick={() => abrirModalContrato(c)}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                              title="Editar contrato"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => excluirContrato(c.id_contrato)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                              title="Excluir contrato"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-slate-400 grid grid-cols-2 gap-2">
                        <p>
                          📅 Vigência: {c.data_inicio} até {c.data_fim}
                        </p>
                        <p>
                          🎯 Limite/dia:{' '}
                          {c.slots_por_dia ? `${c.slots_por_dia} slots` : 'Sem limite'}
                        </p>
                        <p>
                          🎯 Limite/sem:{' '}
                          {c.slots_por_semana ? `${c.slots_por_semana} slots` : 'Sem limite'}
                        </p>
                        <p>
                          🎯 Limite/mês:{' '}
                          {c.slots_por_mes ? `${c.slots_por_mes} slots` : 'Sem limite'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ORGANIZACAO */}
      {modalOrg.aberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-white">
                {modalOrg.editandoId ? 'Alterar Organização' : 'Nova Organização'}
              </h3>
              <button
                onClick={() => setModalOrg({ aberto: false })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvarOrg} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Código Identificador
                  </label>
                  <input
                    type="text"
                    value={formOrg.codigo}
                    onChange={(e) => setFormOrg({ ...formOrg, codigo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={formOrg.telefone}
                    onChange={(e) => setFormOrg({ ...formOrg, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome da Unidade / Academia
                </label>
                <input
                  type="text"
                  value={formOrg.nome}
                  onChange={(e) => setFormOrg({ ...formOrg, nome: e.target.value })}
                  placeholder="Ex: NoWaitFit Jardins"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={formOrg.endereco}
                  onChange={(e) => setFormOrg({ ...formOrg, endereco: e.target.value })}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição / Notas
                </label>
                <textarea
                  value={formOrg.descricao}
                  onChange={(e) => setFormOrg({ ...formOrg, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 h-20"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOrg({ aberto: false })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20"
                >
                  {modalOrg.editandoId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROFISSIONAL EDITAR */}
      {modalProf.aberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-white">Editar Dados e Papéis de Acesso</h3>
              <button
                onClick={() => setModalProf({ aberto: false })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvarProf} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={formProf.name}
                  onChange={(e) => setFormProf({ ...formProf, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formProf.email}
                  onChange={(e) => setFormProf({ ...formProf, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Perfis de Acesso
                </label>
                <div className="space-y-2">
                  {['admin', 'gestor', 'profissional', 'usuario'].map((p) => {
                    const checked = formProf.perfis.includes(p)
                    return (
                      <label key={p} className="flex items-center space-x-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormProf({ ...formProf, perfis: [...formProf.perfis, p] })
                            } else {
                              setFormProf({
                                ...formProf,
                                perfis: formProf.perfis.filter((x) => x !== p),
                              })
                            }
                          }}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className="capitalize">{p}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalProf({ aberto: false })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20"
                >
                  Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VINCULAR PROFISSIONAL */}
      {modalVinculo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-white">Vincular Profissional à Unidade</h3>
              <button
                onClick={() => setModalVinculo(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleVincular} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Usuário</label>
                <select
                  value={formVinculo.id_usuario}
                  onChange={(e) => setFormVinculo({ ...formVinculo, id_usuario: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                >
                  {todosUsuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organização</label>
                <select
                  value={formVinculo.id_organizacao}
                  onChange={(e) =>
                    setFormVinculo({ ...formVinculo, id_organizacao: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                >
                  {organizacoes.map((o) => (
                    <option key={o.id_organizacao} value={o.id_organizacao}>
                      {o.nome} ({o.codigo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Papel</label>
                <select
                  value={formVinculo.papel}
                  onChange={(e) =>
                    setFormVinculo({
                      ...formVinculo,
                      papel: e.target.value as 'admin' | 'gestor' | 'profissional' | 'aluno',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                >
                  <option value="profissional">Profissional / Fisioterapeuta</option>
                  <option value="gestor">Gestor da Unidade</option>
                  <option value="admin">Administrador</option>
                  <option value="aluno">Aluno</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalVinculo(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20"
                >
                  Confirmar Vínculo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SLOT NOVO/EDITAR */}
      {modalSlot.aberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-white">
                {modalSlot.editandoId ? 'Alterar Slot de Agenda' : 'Novo Slot de Horário'}
              </h3>
              <button
                onClick={() => setModalSlot({ aberto: false })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvarSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organização</label>
                <select
                  value={formSlot.id_organizacao}
                  onChange={(e) => setFormSlot({ ...formSlot, id_organizacao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                >
                  {organizacoes.map((o) => (
                    <option key={o.id_organizacao} value={o.id_organizacao}>
                      {o.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data</label>
                  <input
                    type="date"
                    value={formSlot.data}
                    onChange={(e) => setFormSlot({ ...formSlot, data: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Capacidade (Vagas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSlot.quantidade}
                    onChange={(e) =>
                      setFormSlot({ ...formSlot, quantidade: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Início</label>
                  <input
                    type="text"
                    value={formSlot.inicio}
                    onChange={(e) => setFormSlot({ ...formSlot, inicio: e.target.value })}
                    placeholder="08:00:00"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fim</label>
                  <input
                    type="text"
                    value={formSlot.fim}
                    onChange={(e) => setFormSlot({ ...formSlot, fim: e.target.value })}
                    placeholder="09:00:00"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Recurso / Modalidade
                </label>
                <input
                  type="text"
                  value={formSlot.recurso}
                  onChange={(e) => setFormSlot({ ...formSlot, recurso: e.target.value })}
                  placeholder="Ex: Musculação / Pilates / Fisio"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Profissional Responsável (Opcional)
                </label>
                <select
                  value={formSlot.id_profissional}
                  onChange={(e) => setFormSlot({ ...formSlot, id_profissional: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                >
                  <option value="">Nenhum / Aberto para todos</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalSlot({ aberto: false })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20"
                >
                  {modalSlot.editandoId ? 'Atualizar Slot' : 'Criar Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GERAR EM LOTE */}
      {modalLote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-white">Gerar Grade em Lote (/slots/lote)</h3>
              <button
                onClick={() => setModalLote(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCriarLote} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organização</label>
                <select
                  value={formLote.id_organizacao}
                  onChange={(e) => setFormLote({ ...formLote, id_organizacao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                >
                  {organizacoes.map((o) => (
                    <option key={o.id_organizacao} value={o.id_organizacao}>
                      {o.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Data da Grade
                  </label>
                  <input
                    type="date"
                    value={formLote.data}
                    onChange={(e) => setFormLote({ ...formLote, data: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vagas por Slot
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formLote.quantidade}
                    onChange={(e) =>
                      setFormLote({ ...formLote, quantidade: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hora Início (ex: 8)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formLote.horaInicio}
                    onChange={(e) =>
                      setFormLote({ ...formLote, horaInicio: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hora Fim (ex: 18)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formLote.horaFim}
                    onChange={(e) => setFormLote({ ...formLote, horaFim: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Recurso / Modalidade
                </label>
                <input
                  type="text"
                  value={formLote.recurso}
                  onChange={(e) => setFormLote({ ...formLote, recurso: e.target.value })}
                  placeholder="Ex: Treino Funcional / Avaliação"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalLote(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20"
                >
                  Gerar Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONTRATO NOVO/EDITAR */}
      {modalContrato.aberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-white">
                {modalContrato.editandoId ? 'Alterar Contrato' : 'Novo Contrato de Aluno'}
              </h3>
              <button
                onClick={() => setModalContrato({ aberto: false })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvarContrato} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Aluno / Usuário
                </label>
                <select
                  value={formContrato.id_usuario}
                  onChange={(e) => setFormContrato({ ...formContrato, id_usuario: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                >
                  {todosUsuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organização</label>
                <select
                  value={formContrato.id_organizacao}
                  onChange={(e) =>
                    setFormContrato({ ...formContrato, id_organizacao: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  required
                >
                  {organizacoes.map((o) => (
                    <option key={o.id_organizacao} value={o.id_organizacao}>
                      {o.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome do Plano
                  </label>
                  <input
                    type="text"
                    value={formContrato.plano_nome}
                    onChange={(e) =>
                      setFormContrato({ ...formContrato, plano_nome: e.target.value })
                    }
                    placeholder="Ex: Mensal 10 Slots"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Saldo de Slots
                  </label>
                  <input
                    type="number"
                    value={formContrato.saldo_slots}
                    onChange={(e) =>
                      setFormContrato({ ...formContrato, saldo_slots: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Slots / Dia
                  </label>
                  <input
                    type="number"
                    value={formContrato.slots_por_dia}
                    onChange={(e) =>
                      setFormContrato({ ...formContrato, slots_por_dia: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Slots / Semana
                  </label>
                  <input
                    type="number"
                    value={formContrato.slots_por_semana}
                    onChange={(e) =>
                      setFormContrato({ ...formContrato, slots_por_semana: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Slots / Mês
                  </label>
                  <input
                    type="number"
                    value={formContrato.slots_por_mes}
                    onChange={(e) =>
                      setFormContrato({ ...formContrato, slots_por_mes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={formContrato.data_inicio}
                    onChange={(e) =>
                      setFormContrato({ ...formContrato, data_inicio: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={formContrato.data_fim}
                    onChange={(e) => setFormContrato({ ...formContrato, data_fim: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalContrato({ aberto: false })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20"
                >
                  {modalContrato.editandoId ? 'Atualizar Contrato' : 'Criar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default App
