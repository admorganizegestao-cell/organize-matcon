import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-[hsl(var(--muted-foreground))] mb-6">Página não encontrada</p>
      <Link to="/">
        <Button>
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>
      </Link>
    </div>
  )
}
