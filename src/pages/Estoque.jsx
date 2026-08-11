import React, { useState } from 'react'
import { Boxes, Plus, Trash2, Pencil } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import Modal, { Field, inputClass } from '../components/Modal'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'

const emptyForm = { name: '', category: '', cost: '', current_qty: '', minimum_qty: '' }

export default function Estoque() {
  const { items: products, loading, error, add, update, remove } = useSupabaseCollection('estoque')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const totalValue = products.reduce((sum, p) => sum + (Number(p.cost) || 0) * (Number(p.current_qty) || 0), 0)
  const lowStockCount = products.filter(p => Number(p.current_qty) <= Number(p.minimum_qty)).length

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      category: product.category || '',
      cost: product.cost ?? '',
      current_qty: product.current_qty ?? '',
      minimum_qty: product.minimum_qty ?? ''
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setFormError('')
    const payload = {
      name: form.name,
      category: form.category,
      cost: Number(form.cost) || 0,
      current_qty: Number(form.current_qty) || 0,
      minimum_qty: Number(form.minimum_qty) || 0
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
    if (confirm('Excluir este produto?')) await remove(id)
  }

  return (
    <div>
      <PageHeader
        title="Estoque"
        subtitle="Gestão de produtos e insumos"
        icon={Boxes}
        actions={
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        }
      />

      {error && (
        <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 text-sm text-[#EF4444]">
          Erro ao carregar estoque: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Valor em Estoque" value={totalValue} format="currency" icon={Boxes} accent="primary" />
        <StatCard label="Total de Produtos" value={products.length} format="number" icon={Boxes} accent="success" />
        <StatCard label="Estoque Baixo" value={lowStockCount} format="number" icon={Boxes} accent="warning" />
      </div>

      {loading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Carregando...</p>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Nenhum produto cadastrado"
          description="Cadastre os produtos e insumos usados no salão para controlar o estoque."
          action={<Button onClick={openNew}><Plus className="w-4 h-4" />Cadastrar produto</Button>}
        />
      ) : (
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
                  <th className="text-right py-3 px-4 font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const low = Number(p.current_qty) <= Number(p.minimum_qty)
                  return (
                    <tr key={p.id} className="border-b border-[hsl(var(--border))]/50 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{p.name}</td>
                      <td className="py-3 px-4 text-[hsl(var(--muted-foreground))]">{p.category}</td>
                      <td className="py-3 px-4 text-right text-white">R$ {Number(p.cost).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span className={low ? 'text-[#EF4444]' : 'text-[#22C55E]'}>{p.current_qty}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 text-xs rounded ${low ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#22C55E]/10 text-[#22C55E]'}`}>
                          {low ? 'Baixo' : 'OK'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-white/10 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[#EF4444]">
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
        title={editingId ? 'Editar Produto' : 'Novo Produto'}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nome *">
            <input required className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Categoria">
            <input className={inputClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Shampoo, Tintura..." />
          </Field>
          <Field label="Custo (R$)">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
          </Field>
          <Field label="Quantidade atual">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.current_qty} onChange={e => setForm({ ...form, current_qty: e.target.value })} />
          </Field>
          <Field label="Quantidade mínima">
            <input type="number" min="0" step="0.01" className={inputClass} value={form.minimum_qty} onChange={e => setForm({ ...form, minimum_qty: e.target.value })} />
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
