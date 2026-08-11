import { useState, useEffect, useCallback, useContext } from 'react'
import { supabase } from '../lib/salaoSupabaseClient'
import { AuthContext } from '../contexts/AuthContext'

// Hook genérico de CRUD contra uma tabela Supabase, isolado por user_id (RLS).
export function useSupabaseCollection(table, { orderBy = 'created_at', ascending = false } = {}) {
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
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .order(orderBy, { ascending })
      if (err) throw err
      setItems(data ?? [])
    } catch (err) {
      setError(err.message)
      console.error(`Error fetching ${table}:`, err)
    } finally {
      setLoading(false)
    }
  }, [user, table, orderBy, ascending])

  useEffect(() => {
    if (user) fetchItems()
  }, [user, fetchItems])

  async function add(item) {
    try {
      const { data, error: err } = await supabase
        .from(table)
        .insert([{ ...item, user_id: user.id }])
        .select()
      if (err) throw err
      if (data && data.length > 0) setItems(prev => [data[0], ...prev])
      return { data: data?.[0], error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  async function update(id, updates) {
    try {
      const { data, error: err } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
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
        .from(table)
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
