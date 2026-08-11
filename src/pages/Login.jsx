import React, { useState, useContext } from 'react'
import { Sparkles } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'
import Button from '../components/Button'
import { inputClass } from '../components/Modal'

export default function Login() {
  const { signIn, signUp } = useContext(AuthContext)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    if (mode === 'signin') {
      const { error: err } = await signIn(email, password)
      if (err) setError(traduzErro(err))
    } else {
      const { error: err } = await signUp(email, password, { name })
      if (err) {
        setError(traduzErro(err))
      } else {
        setInfo('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.')
        setMode('signin')
      }
    }
    setLoading(false)
  }

  function traduzErro(msg) {
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
    if (msg.includes('already registered')) return 'Este e-mail já está cadastrado.'
    if (msg.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.'
    return msg
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E040A0] to-[#9333EA] flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Salão 360</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Gestão completa do seu salão</p>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
          <div className="flex mb-6 bg-[hsl(var(--input))] rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setInfo('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'signin' ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setInfo('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'signup' ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="mb-4">
                <label className="text-sm font-medium text-white mb-2 block">Nome do salão</label>
                <input type="text" className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="mb-4">
              <label className="text-sm font-medium text-white mb-2 block">E-mail</label>
              <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-white mb-2 block">Senha</label>
              <input type="password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <p className="text-sm text-[#EF4444] mb-4">{error}</p>
            )}
            {info && (
              <p className="text-sm text-[#22C55E] mb-4">{info}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
