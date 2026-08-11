import { useState, useEffect, useCallback, useContext } from 'react'
import { supabase } from '../lib/salaoSupabaseClient'
import { AuthContext } from '../contexts/AuthContext'

const SELECT = '*, cliente:clientes(id,name), profissional:profissionais(id,name,color), servico:servicos(id,name,price,time_minutes)'

export function useAgendamentos() {
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('agendamentos')
        .select(SELECT)
        .eq('user_id', user.id)
        .order('starts_at', { ascending: true })
      if (err) throw err
      setItems(data ?? [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching agendamentos:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchItems()
  }, [user, fetchItems])

  // Verifica se já existe um agendamento do mesmo profissional que colide no horário.
  async function hasConflict({ professionalId, startsAt, durationMinutes, excludeId }) {
    if (!professionalId) return false
    const start = new Date(startsAt)
    const end = new Date(start.getTime() + durationMinutes * 60000)

    const { data, error: err } = await supabase
      .from('agendamentos')
      .select('id, starts_at, duration_minutes')
      .eq('user_id', user.id)
      .eq('professional_id', professionalId)
      .neq('status', 'cancelado')

    if (err) throw err

    return (data ?? []).some(a => {
      if (excludeId && a.id === excludeId) return false
      const aStart = new Date(a.starts_at)
      const aEnd = new Date(aStart.getTime() + (a.duration_minutes || 30) * 60000)
      return start < aEnd && aStart < end
    })
  }

  async function add(item) {
    try {
      const conflict = await hasConflict({
        professionalId: item.professional_id,
        startsAt: item.starts_at,
        durationMinutes: item.duration_minutes
      })
      if (conflict) {
        return { data: null, error: 'Já existe um agendamento para este profissional nesse horário.' }
      }

      const { data, error: err } = await supabase
        .from('agendamentos')
        .insert([{ ...item, user_id: user.id }])
        .select(SELECT)
      if (err) throw err
      if (data && data.length > 0) {
        setItems(prev => [...prev, data[0]].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)))
      }
      return { data: data?.[0], error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  async function update(id, updates) {
    try {
      if (updates.professional_id || updates.starts_at || updates.duration_minutes) {
        const current = items.find(i => i.id === id)
        const conflict = await hasConflict({
          professionalId: updates.professional_id ?? current?.professional_id,
          startsAt: updates.starts_at ?? current?.starts_at,
          durationMinutes: updates.duration_minutes ?? current?.duration_minutes,
          excludeId: id
        })
        if (conflict) {
          return { data: null, error: 'Já existe um agendamento para este profissional nesse horário.' }
        }
      }

      const { data, error: err } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(SELECT)
      if (err) throw err
      if (data && data.length > 0) setItems(prev => prev.map(i => (i.id === id ? data[0] : i)))
      return { data: data?.[0], error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  async function remove(id) {
    try {
      const { error: err } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      if (err) throw err
      setItems(prev => prev.filter(i => i.id !== id))
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    }
  }

  return { items, loading, error, fetchItems, add, update, remove }
}
