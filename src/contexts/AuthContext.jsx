import { createContext, useState, useEffect } from 'react'
import { supabase } from '../supabase-client'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar sessão ao montar
    checkAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function checkAuth() {
    try {
      const { data: { session }, error: err } = await supabase.auth.getSession()
      if (err) throw err
      setUser(session?.user ?? null)
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email, password, metadata = {}) {
    try {
      setError(null)
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      if (err) throw err
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  async function signIn(email, password) {
    try {
      setError(null)
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (err) throw err
      setUser(data.user)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  async function signOut() {
    try {
      setError(null)
      const { error: err } = await supabase.auth.signOut()
      if (err) throw err
      setUser(null)
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    }
  }

  async function resetPassword(email) {
    try {
      setError(null)
      const { error: err } = await supabase.auth.resetPasswordForEmail(email)
      if (err) throw err
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err.message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
