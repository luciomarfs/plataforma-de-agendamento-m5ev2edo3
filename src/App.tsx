/* Main App Component - Handles routing (using react-router-dom), query client and other providers */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Páginas Públicas & Auth
import Index from './pages/Index'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import EsqueciSenha from './pages/EsqueciSenha'
import AlterarSenha from './pages/AlterarSenha'
import NotFound from './pages/NotFound'

// Portal do Usuário
import AgendarUsuario from './pages/AgendarUsuario'
import MeusAgendamentos from './pages/MeusAgendamentos'

// Área da Empresa / Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrganizacoes from './pages/admin/AdminOrganizacoes'
import AdminProfissionais from './pages/admin/AdminProfissionais'
import AdminSlots from './pages/admin/AdminSlots'
import AdminContratos from './pages/admin/AdminContratos'
import AdminBacklog from './pages/admin/AdminBacklog'

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />

            {/* Rotas de Usuário Autenticado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/agendar" element={<AgendarUsuario />} />
              <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
              <Route path="/alterar-senha" element={<AlterarSenha />} />
            </Route>

            {/* Rotas da Empresa / Admin */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/organizacoes" element={<AdminOrganizacoes />} />
              <Route path="/admin/profissionais" element={<AdminProfissionais />} />
              <Route path="/admin/slots" element={<AdminSlots />} />
              <Route path="/admin/contratos" element={<AdminContratos />} />
              <Route path="/admin/backlog" element={<AdminBacklog />} />
            </Route>

            {/* Redirecionamentos e 404 */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default App
