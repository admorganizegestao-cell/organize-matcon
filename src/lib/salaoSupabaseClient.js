import { createClient } from '@supabase/supabase-js'

// Projeto Supabase dedicado ao Salão 360 (separado do banco do ARM/organize-matcon).
// A anon key é uma chave pública por design — o acesso aos dados é controlado por
// Row Level Security (RLS) no banco, não pelo segredo da chave.
const FALLBACK_URL = 'https://nxpycmwsnxhddxblkyun.supabase.co'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54cHljbXdzbnhoZGR4YmxreXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0ODcwMzUsImV4cCI6MjEwMjA2MzAzNX0.gjT290DJAIkpn4gGWjtwv9jauR9MU18eZB021xzk08M'

const supabaseUrl = import.meta.env.VITE_SALAO_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = import.meta.env.VITE_SALAO_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getErrorMessage(error) {
  return error?.message || 'Erro desconhecido'
}
