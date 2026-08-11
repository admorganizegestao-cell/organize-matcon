import React, { useMemo } from 'react'
import { TrendingUp, Wallet, CalendarDays, Package, Clock, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtCurrency, monthNames } from '../lib/utils'
import { useAgendamentos } from '../hooks/useAgendamentos'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'

function isSameLocalDay(iso, date) {
  const d = new Date(iso)
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
}

export default function Dashboard() {
  const { items: agendamentos, loading: loadingAgendamentos } = useAgendamentos()
  const { items: estoque, loading: loadingEstoque } = useSupabaseCollection('estoque')

  const today = new Date()

  const todayAppointments = useMemo(
    () => agendamentos.filter(a => isSameLocalDay(a.starts_at, today)).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [agendamentos]
  )

  const todayRevenue = todayAppointments
    .filter(a => a.status === 'concluido')
    .reduce((sum, a) => sum + (Number(a.servico?.price) || 0), 0)

  const lowStockProducts = estoque.filter(p => Number(p.current_qty) <= Number(p.minimum_qty))

  const last7DaysChart = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const revenue = agendamentos
        .filter(a => a.status === 'concluido' && isSameLocalDay(a.starts_at, d))
        .reduce((sum, a) => sum + (Number(a.servico?.price) || 0), 0)
      days.push({ day: `${d.getDate()}/${monthNames[d.getMonth()]}`, revenue })
    }
    return days
  }, [agendamentos])

  const loading = loadingAgendamentos || loadingEstoque

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do salão em tempo real"
        icon={TrendingUp}
      />

      {lowStockProducts.length > 0 && (
        <div className="mb-6 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                {lowStockProducts.length} produto{lowStockProducts.length > 1 ? 's' : ''} com estoque baixo
              </h3>
              <p className="text-sm text-[#F59E0B]/80">
                {lowStockProducts.map(p => p.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Receita Hoje"
          value={todayRevenue}
          format="currency"
          subtitle={`${todayAppointments.filter(a => a.status === 'concluido').length} atendimento(s) concluído(s)`}
          icon={Wallet}
          accent="success"
        />
        <StatCard
          label="Agendamentos Hoje"
          value={todayAppointments.length}
          format="number"
          subtitle="Total do dia"
          icon={CalendarDays}
          accent="primary"
        />
        <StatCard
          label="Estoque Baixo"
          value={lowStockProducts.length}
          format="number"
          subtitle="Produtos para reabastecer"
          icon={Package}
          accent="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Receita dos Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={last7DaysChart}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E040A0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E040A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                formatter={(value) => fmtCurrency(value)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#E040A0" fillOpacity={1} fill="url(#colorRevenue)" name="Receita" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Agenda de Hoje</h3>
          {loading ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Carregando...</p>
          ) : todayAppointments.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Sem agendamentos hoje" description="Nenhum atendimento marcado para hoje." />
          ) : (
            <div className="space-y-2">
              {todayAppointments.slice(0, 8).map(att => (
                <div key={att.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Clock className="w-4 h-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{att.cliente?.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{att.servico?.name}</p>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] shrink-0">
                    {new Date(att.starts_at).toTimeString().slice(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
