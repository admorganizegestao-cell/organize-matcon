import React, { useState } from 'react'
import { Scissors, Plus, ToggleRight, ToggleLeft } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'

export default function Profissionais() {
  const [professionals] = useState([
    { id: 1, name: 'Marina', role: 'Cabeleireiro', type: 'CLT', commission: 15, phone: '11 99999-1111', color: '#E040A0', active: true },
    { id: 2, name: 'Carlos', role: 'Barbeiro', type: 'Autônomo', commission: 20, phone: '11 99999-2222', color: '#9333EA', active: true },
  ])

  return (
    <div>
      <PageHeader
        title="Profissionais"
        subtitle={`${professionals.length} profissionais`}
        icon={Scissors}
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map(prof => (
          <div
            key={prof.id}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: prof.color }}
              >
                {prof.name[0]}
              </div>
              <h3 className="font-semibold text-white">{prof.name}</h3>
            </div>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">{prof.role}</span>
                <span className="px-2 py-0.5 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded text-xs">
                  {prof.type}
                </span>
              </div>
              <p className="text-[hsl(var(--muted-foreground))]">{prof.commission}% comissão</p>
              <p className="text-[hsl(var(--muted-foreground))]">{prof.phone}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {prof.active ? 'Ativo' : 'Inativo'}
              </p>
              {prof.active ? (
                <ToggleRight className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
