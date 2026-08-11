import React, { useState, useMemo } from 'react'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Modal, { Field, inputClass } from '../components/Modal'
import { useAgendamentos } from '../hooks/useAgendamentos'
import { useClientes } from '../hooks/useClientes'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'
import { todayISO } from '../lib/utils'

const statusLabels = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  faltou: 'Faltou'
}

const statusColors = {
  agendado: 'bg-[#E040A0]',
  confirmado: 'bg-[#3B82F6]',
  concluido: 'bg-[#22C55E]',
  cancelado: 'bg-[#6B7280]',
  faltou: 'bg-[#EF4444]'
}

function toLocalISOString(date, time) {
  return new Date(`${date}T${time}:00`).toISOString()
}

function timeOf(isoString) {
  return new Date(isoString).toTimeString().slice(0, 5)
}

function dateOf(isoString) {
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyForm = { client_id: '', professional_id: '', service_id: '', date: todayISO(), time: '09:00', notes: '' }

export default function Agendamento() {
  const { items: agendamentos, loading, add, update, remove } = useAgendamentos()
  const { clientes } = useClientes()
  const { items: professionals } = useSupabaseCollection('profissionais')
  const { items: services } = useSupabaseCollection('servicos')

  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const activeProfessionals = professionals.filter(p => p.active !== false)

  const dayAppointments = useMemo(
    () => agendamentos.filter(a => dateOf(a.starts_at) === selectedDate),
    [agendamentos, selectedDate]
  )

  function handlePrevDay() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  function handleNextDay() {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  function getHourSlots() {
    const slots = []
    for (let i = 8; i < 20; i++) slots.push(`${String(i).padStart(2, '0')}:00`)
    return slots
  }

  function openNew(prefill = {}) {
    setForm({ ...emptyForm, date: selectedDate, ...prefill })
    setFormError('')
    setShowNewModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.client_id || !form.professional_id || !form.service_id) {
      setFormError('Preencha cliente, profissional e serviço.')
      return
    }
    const service = services.find(s => s.id === form.service_id)
    setSaving(true)
    setFormError('')
    const result = await add({
      client_id: form.client_id,
      professional_id: form.professional_id,
      service_id: form.service_id,
      starts_at: toLocalISOString(form.date, form.time),
      duration_minutes: service?.time_minutes || 30,
      notes: form.notes,
      status: 'agendado'
    })
    setSaving(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setShowNewModal(false)
  }

  async function handleStatusChange(id, status) {
    await update(id, { status })
    setShowDetail(prev => (prev ? { ...prev, status } : prev))
  }

  async function handleDeleteAppointment(id) {
    if (confirm('Excluir este agendamento?')) {
      await remove(id)
      setShowDetail(null)
    }
  }

  const canSchedule = activeProfessionals.length > 0 && services.length > 0 && clientes.length > 0

  return (
    <div>
      <PageHeader
        title="Agendamento"
        subtitle="Agenda de atendimentos por profissional"
        icon={CalendarDays}
        actions={
          <Button onClick={() => openNew()} disabled={!canSchedule}>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      {!canSchedule && (
        <div className="mb-6 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 text-sm text-[#F59E0B]">
          Para criar um agendamento, cadastre pelo menos um cliente, um profissional ativo e um serviço.
        </div>
      )}

      {/* Date Selector */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-4">
          <button onClick={handlePrevDay} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('pt-BR', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
              }).replace(/^\w/, c => c.toUpperCase())}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={handleNextDay} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {activeProfessionals.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum profissional ativo"
          description="Cadastre profissionais para montar a agenda."
        />
      ) : (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="inline-grid grid-cols-[60px_repeat(auto-fit,minmax(200px,1fr))] gap-0 min-w-full">
              <div className="col-span-1 sticky left-0 z-10 bg-[hsl(var(--card))]" />
              {activeProfessionals.map(prof => (
                <div key={prof.id} className="p-3 border-b border-r border-[hsl(var(--border))] text-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold"
                    style={{ backgroundColor: prof.color }}
                  >
                    {prof.name?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{prof.name}</p>
                </div>
              ))}

              {getHourSlots().map(time => (
                <React.Fragment key={time}>
                  <div className="p-3 border-b border-r border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--muted-foreground))] h-14 flex items-center sticky left-0 z-10 bg-[hsl(var(--card))]">
                    {time}
                  </div>
                  {activeProfessionals.map(prof => {
                    const appt = dayAppointments.find(a => a.professional_id === prof.id && timeOf(a.starts_at) === time)
                    return (
                      <div
                        key={`${prof.id}-${time}`}
                        onClick={() => (appt ? setShowDetail(appt) : openNew({ professional_id: prof.id, time }))}
                        className="p-2 border-b border-r border-[hsl(var(--border))] h-14 relative cursor-pointer hover:bg-white/5"
                      >
                        {appt && (
                          <div className={`${statusColors[appt.status]} rounded-lg p-2 text-xs text-white truncate`}>
                            {appt.cliente?.name || 'Cliente removido'}
                            <span className="opacity-80"> · {appt.servico?.name}</span>
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
      )}

      {/* Modal: New Schedule */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Novo Agendamento">
        <form onSubmit={handleSubmit}>
          <Field label="Cliente *">
            <select required className={inputClass} value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
              <option value="">Selecione um cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Profissional *">
            <select required className={inputClass} value={form.professional_id} onChange={e => setForm({ ...form, professional_id: e.target.value })}>
              <option value="">Selecione um profissional</option>
              {activeProfessionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Horário">
              <input type="time" className={inputClass} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </Field>
          </div>
          <Field label="Serviço *">
            <select required className={inputClass} value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}>
              <option value="">Selecione um serviço</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {Number(s.price).toFixed(2)}</option>)}
            </select>
          </Field>
          <Field label="Observações">
            <textarea
              className={inputClass + ' resize-none'}
              rows="3"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Adicione anotações sobre o agendamento..."
            />
          </Field>
          {formError && <p className="text-sm text-[#EF4444] mb-2">{formError}</p>}
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNewModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Agendar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Appointment Detail */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Detalhes do Agendamento">
        {showDetail && (
          <div>
            <div className="space-y-2 mb-4 text-sm">
              <p className="text-white font-semibold text-base">{showDetail.cliente?.name}</p>
              <p className="text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                <Clock className="w-4 h-4" /> {timeOf(showDetail.starts_at)} · {dateOf(showDetail.starts_at)}
              </p>
              <p className="text-[hsl(var(--muted-foreground))]">Serviço: {showDetail.servico?.name}</p>
              <p className="text-[hsl(var(--muted-foreground))]">Profissional: {showDetail.profissional?.name}</p>
              {showDetail.notes && <p className="text-[hsl(var(--muted-foreground))]">Obs: {showDetail.notes}</p>}
            </div>
            <Field label="Status">
              <select
                className={inputClass}
                value={showDetail.status}
                onChange={e => handleStatusChange(showDetail.id, e.target.value)}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <div className="flex gap-3 mt-6">
              <Button variant="destructive" className="flex-1" onClick={() => handleDeleteAppointment(showDetail.id)}>Excluir</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowDetail(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
