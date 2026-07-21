import React, { useState, useContext } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'
import Button from '../components/Button'

export default function Register() {
  const { user, signUp, error: authError } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validações
    if (!email || !password || !nome) {
      setError('Preencha todos os campos')
      return
    }

    if (password !== confirmPassword) {
      setError('Senhas não conferem')
      return
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    const { error: err } = await signUp(email, password, { nome })

    if (err) {
      setError(err)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0E0E10] to-[#1A1B1F]">
        <div className="w-full max-w-md px-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Conta criada!</h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              Verifique seu email para confirmar a conta
            </p>
            <Link to="/login">
              <Button className="w-full">Voltar ao login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-white text-center mb-2">Criar Conta</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-center mb-8">
          Comece a gerenciar seu salão agora
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

          {/* Nome */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              required
            />
          </div>

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

          {/* Confirmar Senha */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        {/* Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Já tem conta?{' '}
            <Link to="/login" className="text-[hsl(var(--primary))] hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
