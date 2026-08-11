import React, { useState } from 'react'
import { Users, Plus, Search, Trash2, Pencil } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Modal, { Field, inputClass } from '../components/Modal'
import { useClientes } from '../hooks/useClientes'

const emptyForm = { name: '', phone: '', email: '', origin: '' }

export default function Clientes() {
  const { clientes, loading, error, createCliente, updateCliente, deleteCliente } = useClientes()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const filtered = clientes.filter(c =>
    !search.trim() ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(client) {
    setEditingId(client.id)
    setForm({ name: client.name, phone: client.phone || '', email: client.email || '', origin: client.origin || '' })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setFormError('')
    const result = editingId ? await updateCliente(editingId, form) : await createCliente(form)
    setSaving(false)
    if (result.error) {
      setFormError(result.error)
      return
    }
    setModalOpen(false)
  }

  async function handleDelete(id) {
    if (confirm('Excluir este cliente?')) await deleteCliente(id)
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} cadastrado${clientes.length !== 1 ? 's' : ''}`}
        icon={Users}
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      {error && (
        <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 text-sm text-[#EF4444]">
          Erro ao carregar clientes: {error}
        </div>
      )}

      {clientes.length > 0 && (
        <div className="mb-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="w-full pl-10 pr-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Carregando...</p>
      ) : clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Cadastre seu primeiro cliente para começar a agendar atendimentos."
          action={<Button onClick={openNew}><Plus className="w-4 h-4" />Cadastrar cliente</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <div
              key={client.id}
              className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 hover:border-[hsl(var(--primary))]/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E040A0]/20 to-[#E040A0]/5 flex items-center justify-center text-[hsl(var(--primary))] font-bold shrink-0">
                  {client.name?.[0]?.toUpperCase()}
                </div>
                <h3 className="font-semibold text-white flex-1 min-w-0 truncate">{client.name}</h3>
                <button onClick={() => openEdit(client)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(client.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[#EF4444] shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1 text-sm mb-3">
                <p className="text-[hsl(var(--muted-foreground))]">{client.phone || '-'}</p>
                <p className="text-[hsl(var(--muted-foreground))]">{client.email || '-'}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                <div className="text-xs">
                  <p className="text-[hsl(var(--muted-foreground))]">{client.origin || 'Não informado'}</p>
                  <p className="text-white font-semibold">{client.visits || 0} visitas</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nome *">
            <input required className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Telefone">
            <input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="11 99999-9999" />
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Origem">
            <select className={inputClass} value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })}>
              <option value="">Selecione</option>
              <option>Instagram</option>
              <option>Indicação</option>
              <option>Google</option>
              <option>Outro</option>
            </select>
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
