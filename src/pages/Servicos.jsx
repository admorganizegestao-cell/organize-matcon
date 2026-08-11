import React, { useState } from 'react'
import { Sparkles, Plus, Trash2, Pencil } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Modal, { Field, inputClass } from '../components/Modal'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'
import { calcMargin } from '../lib/utils'

const emptyForm = { name: '', category: '', time_minutes: '', cost: '', price: '', commission: '' }

export default function Servicos() {
  const { items: services, loading, error, add, update, remove } = useSupabaseCollection('servicos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(service) {
    setEditingId(service.id)
    setForm({
      name: service.name,
      category: service.category || '',
      time_minutes: service.time_minutes ?? '',
      cost: service.cost ?? '',
      price: service.price ?? '',
      commission: service.commission ?? ''
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    setFormError('')
    const payload = {
      name: form.name,
      category: form.category,
      time_minutes: Number(form.time_minutes) || 0,
      cost: Number(form.cost) || 0,
      price: Number(form.price) || 0,
      commission: Number(form.commission) || 0
    }
    const result = editingId ? await update(editingId, payload) : await add(payload)
    setSaving(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setModalOpen(false)
  }

  async function handleDelete(id) {
    if (confirm('Excluir este serviço?')) await remove(id)
  }

  return (
    <div>
      <PageHeader
        title="Precificação de Serviços"
        subtitle={`${services.length} serviço${services.length !== 1 ? 's' : ''}`}
        icon={Sparkles}
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      {error && (
        <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 text-sm text-[#EF4444]">
          Erro ao carregar serviços: {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Carregando...</p>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nenhum serviço cadastrado"
          description="Cadastre os serviços oferecidos pelo salão com preço e custo."
          action={<Button onClick={openNew}><Plus className="w-4 h-4" />Cadastrar serviço</Button>}
        />
      ) : (
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
                  <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => {
                  const margin = calcMargin(s.price, s.cost)
                  return (
                    <tr key={s.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{s.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{s.time_minutes}min</td>
                      <td className="py-3 px-4 text-right text-white">R$ {Number(s.cost).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-white font-medium">R$ {Number(s.price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          margin >= 60 ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                          margin >= 30 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                          'bg-[#EF4444]/10 text-[#EF4444]'
                        }`}>
                          {margin.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-white">{s.commission}%</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[#EF4444]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nome *">
            <input required className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Categoria">
            <input className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Cabelo, Barba, Unha..." />
          </Field>
          <Field label="Tempo (minutos)">
            <input type="number" min="0" className={inputClass} value={form.time_minutes} onChange={e => setForm({ ...form, time_minutes: e.target.value })} />
          </Field>
          <Field label="Custo (R$)">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
          </Field>
          <Field label="Preço (R$) *">
            <input required type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Comissão (%)">
            <input type="number" min="0" max="100" className={inputClass} value={form.commission} onChange={e => setForm({ ...form, commission: e.target.value })} />
          </Field>
          {formError && <p className="text-sm text-[#EF4444] mb-2">{formError}</p>}
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Salvando...' : editingId ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
