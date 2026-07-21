import React, { useState } from 'react'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, User2, Scissors } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import { fmtDate, fmtTime, addDays, isSameDay, todayISO } from '../lib/utils'

// Mock data
const mockData = {
  professionals: [
    { id: 1, name: 'Marina', color: '#E040A0', type: 'CLT' },
    { id: 2, name: 'Carlos', color: '#9333EA', type: 'Autônomo' },
  ],
  schedules: [
    { id: 1, professionalId: 1, clientName: 'Maria Silva', service: 'Corte + Escova', date: '2024-12-20', time: '09:00', status: 'agendado' },
    { id: 2, professionalId: 2, clientName: 'João Santos', service: 'Barba', date: '2024-12-20', time: '10:30', status: 'confirmado' },
  ]
}

export default function Agendamento() {
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [showNewModal, setShowNewModal] = useState(false)
  const [recurringType, setRecurringType] = useState('none')

  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const getTodaySchedulesCount = () => {
    return mockData.schedules.filter(s => s.date === selectedDate).length
  }

  const getHourSlots = () => {
    const slots = []
    for (let i = 8; i < 20; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`)
    }
    return slots
  }

  const getStatusColor = (status) => {
    const colors = {
      agendado: 'bg-[#E040A0]',
      confirmado: 'bg-[#3B82F6]',
      realizado: 'bg-[#22C55E]',
      cancelado: 'bg-[#EF4444]'
    }
    return colors[status] || 'bg-[#E040A0]'
  }

  return (
    <div>
      <PageHeader
        title="Agendamento"
        subtitle="Agenda de atendimentos por profissional"
        icon={CalendarDays}
        actions={
          <Button onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      {/* Date Selector */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }).replace(/^\w/, c => c.toUpperCase())}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {getTodaySchedulesCount()} agendamento{getTodaySchedulesCount() !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-grid grid-cols-[60px_repeat(auto-fit,minmax(250px,1fr))] gap-0 min-w-full">
            {/* Header */}
            <div className="col-span-1 sticky left-0 z-10" />
            {mockData.professionals.map(prof => (
              <div
                key={prof.id}
                className="p-3 border-b border-r border-[hsl(var(--border))] text-center"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold"
                  style={{ backgroundColor: prof.color }}
                >
                  {prof.name[0]}
                </div>
                <p className="text-xs font-semibold text-white truncate">{prof.name}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{prof.type}</p>
              </div>
            ))}

            {/* Time Slots */}
            {getHourSlots().map(time => (
              <React.Fragment key={time}>
                <div className="p-3 border-b border-r border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--muted-foreground))] h-12 flex items-center sticky left-0 z-10 bg-[hsl(var(--card))]">
                  {time}
                </div>
                {mockData.professionals.map(prof => {
                  const schedule = mockData.schedules.find(
                    s => s.professionalId === prof.id && s.date === selectedDate && s.time === time
                  )
                  return (
                    <div
                      key={`${prof.id}-${time}`}
                      className="p-2 border-b border-r border-[hsl(var(--border))] h-12 relative"
                    >
                      {schedule && (
                        <div
                          className={`${getStatusColor(schedule.status)} rounded-lg p-2 text-xs text-white truncate cursor-pointer hover:opacity-90 transition-opacity`}
                        >
                          {schedule.clientName}
                        </div>
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: New Schedule */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Novo Agendamento</h2>

            <div className="space-y-4 mb-6">
              {/* Client */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Cliente *</label>
                <select className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]">
                  <option>Selecione um cliente</option>
                  <option>Maria Silva</option>
                  <option>João Santos</option>
                </select>
              </div>

              {/* Professional */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Profissional *</label>
                <select className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]">
                  <option>Selecione um profissional</option>
                  {mockData.professionals.map(p => (
                    <option key={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Data</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Horário</label>
                  <select className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm">
                    <option>09:00</option>
                    <option>10:00</option>
                    <option>11:00</option>
                  </select>
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Tipo</label>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-[hsl(var(--primary))] text-white text-sm rounded-lg font-medium">
                    Serviço
                  </button>
                  <button className="flex-1 px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm rounded-lg hover:bg-white/5">
                    Combo
                  </button>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Serviço *</label>
                <select className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm">
                  <option>Corte + Escova - R$ 150,00</option>
                  <option>Barba - R$ 50,00</option>
                  <option>Manicure - R$ 80,00</option>
                </select>
              </div>

              {/* Recurring */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Agendar Recorrentemente</label>
                <select
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value)}
                  className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm"
                >
                  <option value="none">Não repetir</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="biweekly">A cada 2 semanas</option>
                  <option value="monthly">Mensalmente</option>
                  <option value="custom">Personalizar...</option>
                </select>
              </div>

              {/* Custom Recurring Cycle */}
              {recurringType === 'custom' && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Duração do Ciclo (em semanas)</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    defaultValue="4"
                    className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm"
                    placeholder="Ex: 4 (a cada 4 semanas)"
                  />
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    Deixe em branco para não repetir
                  </p>
                </div>
              )}

              {/* Number of Repetitions */}
              {recurringType !== 'none' && recurringType !== 'custom' && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Repetir por quantas semanas?</label>
                  <select className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm">
                    <option>4 semanas</option>
                    <option>8 semanas</option>
                    <option>12 semanas</option>
                    <option>26 semanas</option>
                    <option>52 semanas</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Observações</label>
                <textarea
                  className="w-full px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm resize-none"
                  rows="3"
                  placeholder="Adicione anotações sobre o agendamento..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowNewModal(false)}
              >
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => setShowNewModal(false)}>
                Agendar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
