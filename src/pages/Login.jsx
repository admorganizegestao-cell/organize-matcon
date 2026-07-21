import React, { useState, useContext } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'
import Button from '../components/Button'

export default function Login() {
  const { user, signIn, error: authError } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: err } = await signIn(email, password)

    if (err) {
      setError(err)
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0E0E10] to-[#1A1B1F]">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E040A0] to-[#9333EA] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">Salão 360</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-center mb-8">
          Gestão completa para seu salão de beleza
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Erro */}
          {(error || authError) && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg">
              <p className="text-sm text-[#EF4444]">
                {error || authError}
              </p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              required
            />
          </div>

          {/* Senha */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              required
            />
          </div>

          {/* Botão */}
          <Button
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Não tem conta?{' '}
            <Link to="/register" className="text-[hsl(var(--primary))] hover:underline font-medium">
              Criar agora
            </Link>
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            <Link to="/forgot-password" className="text-[hsl(var(--primary))] hover:underline">
              Esqueceu a senha?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
