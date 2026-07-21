import React from 'react'
import { Sparkles, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'

export default function Servicos() {
  const services = [
    { id: 1, name: 'Corte + Escova', category: 'Cabelo', time: 60, cost: 30, price: 150, margin: 80, commission: 15 },
    { id: 2, name: 'Barba', category: 'Barba', time: 30, cost: 0, price: 50, margin: 100, commission: 10 },
  ]

  return (
    <div>
      <PageHeader
        title="Precificação de Serviços"
        subtitle={`${services.length} serviços`}
        icon={Sparkles}
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[hsl(var(--border))]">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Serviço</th>
                <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Tempo</th>
                <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Custo</th>
                <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Preço</th>
                <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Margem</th>
                <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{s.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.category}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{s.time}min</td>
                  <td className="py-3 px-4 text-right text-white">R$ {s.cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-white font-medium">R$ {s.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      s.margin >= 60 ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                      s.margin >= 30 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                      'bg-[#EF4444]/10 text-[#EF4444]'
                    }`}>
                      {s.margin.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white">{s.commission}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
