import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Agendamento from './pages/Agendamento'
import Clientes from './pages/Clientes'
import Profissionais from './pages/Profissionais'
import Estoque from './pages/Estoque'
import Servicos from './pages/Servicos'
import Marketing from './pages/Marketing'
import NotFound from './pages/NotFound'

function RequireAuth({ children }) {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] text-sm">
        Carregando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] text-sm">
        Carregando...
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/profissionais" element={<Profissionais />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/marketing" element={<Marketing />} />

          {/* Rotas não implementadas */}
          <Route path="/combos" element={<div className="p-6"><p className="text-white">Combos - Em construção</p></div>} />
          <Route path="/produtividade" element={<div className="p-6"><p className="text-white">Produtividade - Em construção</p></div>} />
          <Route path="/financeiro" element={<div className="p-6"><p className="text-white">Financeiro - Em construção</p></div>} />
          <Route path="/fpa" element={<div className="p-6"><p className="text-white">FPA - Em construção</p></div>} />
          <Route path="/conciliacao" element={<div className="p-6"><p className="text-white">Conciliação - Em construção</p></div>} />
          <Route path="/comissoes" element={<div className="p-6"><p className="text-white">Comissões - Em construção</p></div>} />
          <Route path="/relatorios" element={<div className="p-6"><p className="text-white">Relatórios - Em construção</p></div>} />
          <Route path="/planejamento" element={<div className="p-6"><p className="text-white">Planejamento - Em construção</p></div>} />
          <Route path="/configuracoes" element={<div className="p-6"><p className="text-white">Configurações - Em construção</p></div>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function SalaoApp() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
