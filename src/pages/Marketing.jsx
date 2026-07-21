import React from 'react'
import { Megaphone, Plus, FileDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtPercent, fmtCurrency } from '../lib/utils'

export default function Marketing() {
  const campaigns = [
    { id: 1, name: 'Promoção Instagram', channel: 'Instagram', investment: 500, revenue: 2250, clients: 15, roi: 350 },
    { id: 2, name: 'Indicações', channel: 'Indicação', investment: 0, revenue: 1500, clients: 10, roi: 0 },
  ]

  const chartData = campaigns.map(c => ({
    name: c.channel,
    roi: c.roi
  }))

  return (
    <div>
      <PageHeader
        title="Marketing"
        subtitle="Acompanhe o retorno de cada canal de campanha"
        icon={Megaphone}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="w-4 h-4" />
              PDF
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Nova Campanha
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Investimento Total"
          value={500}
          format="currency"
          icon={Megaphone}
          accent="primary"
        />
        <StatCard
          label="Receita Atribuída"
          value={3750}
          format="currency"
          icon={Megaphone}
          accent="success"
        />
        <StatCard
          label="ROI Geral"
          value={650}
          format="percent"
          icon={Megaphone}
          accent="warning"
        />
        <StatCard
          label="Clientes Gerados"
          value={25}
          format="number"
          icon={Megaphone}
          accent="blue"
        />
      </div>

      {/* ROI Chart */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-white mb-4">ROI por Canal</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value) => fmtPercent(value, 0)}
            />
            <Bar dataKey="roi" fill="#E040A0" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map(camp => (
          <div key={camp.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{camp.name}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{camp.channel}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                camp.roi >= 250 ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                camp.roi >= 0 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                'bg-[#EF4444]/10 text-[#EF4444]'
              }`}>
                {fmtPercent(camp.roi, 0)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 bg-white/5 rounded">
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Investimento</p>
                <p className="text-sm font-semibold text-white">{fmtCurrency(camp.investment)}</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Receita</p>
                <p className="text-sm font-semibold text-white">{fmtCurrency(camp.revenue)}</p>
              </div>
            </div>

            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              <p>{camp.clients} clientes gerados</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
