import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Agendamento from './pages/Agendamento'
import Clientes from './pages/Clientes'
import Profissionais from './pages/Profissionais'
import Estoque from './pages/Estoque'
import Servicos from './pages/Servicos'
import Marketing from './pages/Marketing'
import NotFound from './pages/NotFound'

export default function SalaoApp() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
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
    </Router>
  )
}
