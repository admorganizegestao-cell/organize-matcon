import React, { useState } from 'react'
import { Scissors, Plus, ToggleRight, ToggleLeft, Trash2, Pencil } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Modal, { Field, inputClass } from '../components/Modal'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'

const colors = ['#E040A0', '#9333EA', '#3B82F6', '#22C55E', '#F59E0B']
const emptyForm = { name: '', role: '', type: 'CLT', commission: '', phone: '' }

export default function Profissionais() {
  const { items: professionals, loading, error, add, update, remove } = useSupabaseCollection('profissionais')
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

  function openEdit(prof) {
    setEditingId(prof.id)
    setForm({ name: prof.name, role: prof.role || '', type: prof.type || 'CLT', commission: prof.commission ?? '', phone: prof.phone || '' })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setFormError('')
    const payload = { ...form, commission: Number(form.commission) || 0 }
    const result = editingId
      ? await update(editingId, payload)
      : await add({ ...payload, color: colors[professionals.length % colors.length], active: true })
    setSaving(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setModalOpen(false)
  }

  async function handleDelete(id) {
    if (confirm('Excluir este profissional?')) await remove(id)
  }

  async function toggleActive(prof) {
    await update(prof.id, { active: !prof.active })
  }

  return (
    <div>
      <PageHeader
        title="Profissionais"
        subtitle={`${professionals.length} profissional${professionals.length !== 1 ? 'is' : ''}`}
        icon={Scissors}
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      {error && (
        <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 text-sm text-[#EF4444]">
          Erro ao carregar profissionais: {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Carregando...</p>
      ) : professionals.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Nenhum profissional cadastrado"
          description="Cadastre os profissionais do salão para usar na agenda e comissões."
          action={<Button onClick={openNew}><Plus className="w-4 h-4" />Cadastrar profissional</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map(prof => (
            <div
              key={prof.id}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: prof.color }}
                >
                  {prof.name?.[0]?.toUpperCase()}
                </div>
                <h3 className="font-semibold text-white flex-1 min-w-0 truncate">{prof.name}</h3>
                <button onClick={() => openEdit(prof)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(prof.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[#EF4444] shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[hsl(var(--muted-foreground))]">{prof.role || 'Sem função definida'}</span>
                  {prof.type && (
                    <span className="px-2 py-0.5 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded text-xs">
                      {prof.type}
                    </span>
                  )}
                </div>
                <p className="text-[hsl(var(--muted-foreground))]">{prof.commission || 0}% comissão</p>
                <p className="text-[hsl(var(--muted-foreground))]">{prof.phone || '-'}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {prof.active ? 'Ativo' : 'Inativo'}
                </p>
                <button onClick={() => toggleActive(prof)}>
                  {prof.active ? (
                    <ToggleRight className="w-5 h-5 text-[#22C55E]" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Profissional' : 'Novo Profissional'}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nome *">
            <input required className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Função">
            <input className={inputClass} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Cabeleireiro, Barbeiro, Manicure..." />
          </Field>
          <Field label="Vínculo">
            <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>CLT</option>
              <option>Autônomo</option>
              <option>Parceiro</option>
            </select>
          </Field>
          <Field label="Comissão (%)">
            <input type="number" min="0" max="100" className={inputClass} value={form.commission} onChange={e => setForm({ ...form, commission: e.target.value })} />
          </Field>
          <Field label="Telefone">
            <input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="11 99999-9999" />
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
