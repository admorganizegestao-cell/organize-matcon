import React, { useState } from 'react'
import { Users, Plus, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'

export default function Clientes() {
  const [clients] = useState([
    { id: 1, name: 'Maria Silva', phone: '11 99999-1111', email: 'maria@email.com', origin: 'Indicação', visits: 12 },
    { id: 2, name: 'João Santos', phone: '11 99999-2222', email: 'joao@email.com', origin: 'Instagram', visits: 8 },
  ])

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clients.length} clientes cadastrados`}
        icon={Users}
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      <div className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-10 pr-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <div
            key={client.id}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 hover:border-[hsl(var(--primary))]/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E040A0]/20 to-[#E040A0]/5 flex items-center justify-center text-[hsl(var(--primary))] font-bold">
                {client.name[0]}
              </div>
              <h3 className="font-semibold text-white">{client.name}</h3>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <p className="text-[hsl(var(--muted-foreground))]">{client.phone}</p>
              <p className="text-[hsl(var(--muted-foreground))]">{client.email}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
              <div className="text-xs">
                <p className="text-[hsl(var(--muted-foreground))]">{client.origin}</p>
                <p className="text-white font-semibold">{client.visits} visitas</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
