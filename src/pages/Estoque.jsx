import React from 'react'
import { Boxes, Plus, FileUp, ArrowUpCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import StatCard from '../components/StatCard'

export default function Estoque() {
  const products = [
    { id: 1, name: 'Shampoo Premium', category: 'Shampoo', cost: 45, current: 2, minimum: 5 },
    { id: 2, name: 'Tintura Castanho', category: 'Tintura', cost: 35, current: 1, minimum: 3 },
  ]

  return (
    <div>
      <PageHeader
        title="Estoque"
        subtitle="Gestão de produtos e insumos"
        icon={Boxes}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileUp className="w-4 h-4" />
              Importar NF
            </Button>
            <Button variant="outline">
              <ArrowUpCircle className="w-4 h-4" />
              Movimentação
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Novo
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Valor em Estoque"
          value={5400}
          format="currency"
          icon={Boxes}
          accent="primary"
        />
        <StatCard
          label="Total de Produtos"
          value={24}
          format="number"
          icon={Boxes}
          accent="success"
        />
        <StatCard
          label="Estoque Baixo"
          value={2}
          format="number"
          icon={Boxes}
          accent="warning"
        />
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[hsl(var(--border))]">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Produto</th>
                <th className="text-left py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Categoria</th>
                <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Custo</th>
                <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Estoque</th>
                <th className="text-center py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{p.name}</td>
                  <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{p.category}</td>
                  <td className="py-3 px-4 text-right text-white">R$ {p.cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {p.current <= p.minimum ? (
                      <span className="text-[#EF4444]">{p.current}</span>
                    ) : (
                      <span className="text-[#22C55E]">{p.current}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.current <= p.minimum ? (
                      <span className="px-2 py-1 bg-[#EF4444]/10 text-[#EF4444] text-xs rounded">Baixo</span>
                    ) : (
                      <span className="px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] text-xs rounded">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
