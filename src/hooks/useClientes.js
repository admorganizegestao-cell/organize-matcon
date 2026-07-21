import { useState, useEffect, useContext } from 'react'
import { supabase } from '../supabase-client'
import { AuthContext } from '../contexts/AuthContext'

export function useClientes() {
  const { user } = useContext(AuthContext)
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchClientes()
    }
  }, [user])

  async function fetchClientes() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setClientes(data ?? [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createCliente(cliente) {
    try {
      const { data, error: err } = await supabase
        .from('clientes')
        .insert([{
          ...cliente,
          user_id: user.id
        }])
        .select()

      if (err) throw err

      if (data && data.length > 0) {
        setClientes([data[0], ...clientes])
      }

      return { data: data?.[0], error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  async function updateCliente(id, updates) {
    try {
      const { data, error: err } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (err) throw err

      if (data && data.length > 0) {
        setClientes(clientes.map(c => c.id === id ? data[0] : c))
      }

      return { data: data?.[0], error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  async function deleteCliente(id) {
    try {
      const { error: err } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (err) throw err

      setClientes(clientes.filter(c => c.id !== id))
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    }
  }

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente
  }
}
