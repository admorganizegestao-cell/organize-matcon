import React, { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Wallet, CalendarDays, Package, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmtCurrency, fmtNumber, fmtDate, fmtDateTime, isSameDay, todayISO, monthLabels } from '../lib/utils'
import { cn } from '../lib/utils'

// Mock data - replace with actual data fetching
const mockData = {
  attendances: [
    { id: 1, client: 'Maria Silva', service: 'Corte + Escova', time: '09:00', value: 150, status: 'completed' },
    { id: 2, client: 'João Santos', service: 'Barba', time: '10:30', value: 50, status: 'pending_payment' },
    { id: 3, client: 'Ana Costa', service: 'Manicure', time: '14:00', value: 80, status: 'completed' },
  ],
  pendingPayments: [
    { id: 1, client: 'João Santos', professional: 'Carlos', date: '2024-12-20', value: 50, status: 'pendente_pagamento' },
    { id: 2, client: 'Pedro Oliveira', professional: 'Marina', date: '2024-12-19', value: 120, status: 'pendente_pagamento' },
  ],
  lowStockProducts: [
    { id: 1, name: 'Shampoo Premium', category: 'Shampoo', current: 2, minimum: 5 },
    { id: 2, name: 'Tintura Castanho', category: 'Tintura', current: 1, minimum: 3 },
  ],
  campaigns: [
    { channel: 'Instagram', roi: 350, investment: 500, revenue: 2250, clients: 15 },
    { channel: 'Indicação', roi: 280, investment: 0, revenue: 1500, clients: 10 },
    { channel: 'Google', roi: 120, investment: 300, revenue: 660, clients: 8 },
  ],
  chartData: [
    { month: 'Jan', revenue: 12000, meta: 10000 },
    { month: 'Fev', revenue: 15000, meta: 10000 },
    { month: 'Mar', revenue: 18000, meta: 12000 },
    { month: 'Abr', revenue: 16000, meta: 12000 },
    { month: 'Mai', revenue: 20000, meta: 15000 },
    { month: 'Jun', revenue: 22000, meta: 15000 },
  ]
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const todayAttendances = mockData.attendances
  const todayRevenue = todayAttendances.reduce((sum, a) => sum + a.value, 0)
  const pendingPayments = mockData.pendingPayments
  const lowStockCount = mockData.lowStockProducts.length
  const totalAttendancesToday = todayAttendances.length

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do salão em tempo real"
        icon={TrendingUp}
      />

      {/* Alert: Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 animate-slide-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-1">
                {pendingPayments.length} pagamento{pendingPayments.length > 1 ? 's' : ''} pendente{pendingPayments.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-[#EF4444]/80 mb-3">
                Total de R$ {fmtCurrency(pendingPayments.reduce((sum, p) => sum + p.value, 0))} aguardando recebimento.
              </p>
              <div className="space-y-1">
                {pendingPayments.slice(0, 3).map(payment => (
                  <div key={payment.id} className="flex items-center justify-between text-xs">
                    <span className="text-white">
                      {payment.client} • {fmtCurrency(payment.value)}
                    </span>
                    <span className="text-[#EF4444]/60">
                      {payment.date}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-sm text-[#EF4444] hover:text-white font-medium transition-colors">
                Ver tudo →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert: Low Stock */}
      {lowStockCount > 0 && (
        <div className="mb-6 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                {lowStockCount} produto{lowStockCount > 1 ? 's' : ''} com estoque baixo
              </h3>
              <button className="text-sm text-[#F59E0B] hover:text-white font-medium transition-colors">
                Ver tudo →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Receita Hoje"
          value={todayRevenue}
          format="currency"
          subtitle={`${totalAttendancesToday} atendimento${totalAttendancesToday > 1 ? 's' : ''}`}
          icon={Wallet}
          accent="success"
        />
        <StatCard
          label="Caixa Hoje"
          value={todayRevenue}
          format="currency"
          subtitle="Lançamentos recebidos"
          icon={Wallet}
          accent="success"
        />
        <StatCard
          label="Agendamentos"
          value={totalAttendancesToday}
          format="number"
          subtitle="Hoje"
          icon={CalendarDays}
          accent="primary"
        />
        <StatCard
          label="Estoque Baixo"
          value={lowStockCount}
          format="number"
          subtitle="Produtos para reabastecer"
          icon={Package}
          accent="warning"
        />
      </div>

      {/* Charts and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Receita vs Meta</h3>
            <button className="text-sm text-[hsl(var(--primary))] hover:underline">
              Ver detalhes →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData.chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E040A0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E040A0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value) => fmtCurrency(value)}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#E040A0"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Receita"
              />
              <Area
                type="monotone"
                dataKey="meta"
                stroke="#3B82F6"
                strokeDasharray="5 5"
                fill="none"
                name="Meta"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Schedule */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Agenda de Hoje</h3>
            <button className="text-sm text-[hsl(var(--primary))] hover:underline">
              Ver tudo →
            </button>
          </div>
          <div className="space-y-2">
            {todayAttendances.slice(0, 6).map(att => (
              <div key={att.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Clock className="w-4 h-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{att.client}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{att.service}</p>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">{att.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI by Channel */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">ROI por Canal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={mockData.campaigns}
              layout="vertical"
              margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis dataKey="channel" type="category" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value) => fmtPercent(value, 1)}
              />
              <Bar dataKey="roi" fill="#E040A0" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Alertas de Estoque</h3>
          {mockData.lowStockProducts.length > 0 ? (
            <div className="space-y-2">
              {mockData.lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{product.category}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <p className="text-[#EF4444] font-semibold">{product.current}</p>
                    <p className="text-[hsl(var(--muted-foreground))]">min: {product.minimum}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="Sem alertas"
              description="Todos os produtos estão com estoque ok"
            />
          )}
        </div>
      </div>
    </div>
  )
}
