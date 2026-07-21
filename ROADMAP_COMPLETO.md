# 🚀 Roadmap Completo - Salão 360

**Status:** Em desenvolvimento  
**Prioridade:** Alta  
**Timeline:** 2-3 sprints (2-3 semanas)

---

## 📊 Fase 1: BACKEND + SUPABASE (THIS WEEK)

### 1.1 Setup Supabase

```bash
# 1. Criar projeto em https://supabase.com
# 2. Copiar credentials

# 3. Instalar CLI
npm install -g supabase

# 4. Inicializar local
supabase init
supabase start

# 5. Variáveis de ambiente
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### 1.2 Criar Tabelas no Supabase

```sql
-- 1. Usuários (auth.users automático)

-- 2. Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_nascimento DATE,
  observacoes TEXT,
  total_visitas INT DEFAULT 0,
  origem TEXT DEFAULT 'Indicação',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Profissionais
CREATE TABLE profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  tipo TEXT CHECK (tipo IN ('CLT', 'Autônomo')),
  comissao_percentual NUMERIC DEFAULT 0,
  cargo TEXT,
  ativo BOOLEAN DEFAULT true,
  cor TEXT DEFAULT '#E040A0',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 4. Serviços
CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT,
  tempo_minutos INT DEFAULT 30,
  custo_produto NUMERIC DEFAULT 0,
  preco_venda NUMERIC NOT NULL,
  margem_percentual NUMERIC DEFAULT 0,
  comissao_percentual NUMERIC DEFAULT 0,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 5. Agendamentos
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  cliente_nome TEXT,
  profissional_id UUID REFERENCES profissionais(id) NOT NULL,
  profissional_nome TEXT,
  tipo TEXT DEFAULT 'servico',
  servico_id UUID REFERENCES servicos(id),
  servico_nome TEXT,
  data_hora TIMESTAMP NOT NULL,
  duracao_minutos INT DEFAULT 30,
  valor NUMERIC DEFAULT 0,
  comissao_percentual NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'agendado',
  observacoes TEXT,
  recorrente BOOLEAN DEFAULT false,
  ciclo_dias INT,
  agendamento_pai_id UUID,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 6. Atendimentos
CREATE TABLE atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  cliente_nome TEXT,
  profissional_id UUID REFERENCES profissionais(id) NOT NULL,
  profissional_nome TEXT,
  agendamento_id UUID REFERENCES agendamentos(id),
  itens JSONB DEFAULT '[]',
  valor_total NUMERIC DEFAULT 0,
  comissao_valor NUMERIC DEFAULT 0,
  forma_pagamento TEXT,
  data TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'concluido',
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 7. Lançamentos Financeiros
CREATE TABLE lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  categoria TEXT,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data DATE NOT NULL,
  forma_pagamento TEXT,
  atendimento_id UUID REFERENCES atendimentos(id),
  conciliado BOOLEAN DEFAULT false,
  recorrente BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 8. Campanhas
CREATE TABLE campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  canal TEXT NOT NULL,
  investimento NUMERIC NOT NULL,
  clientes_gerados INT DEFAULT 0,
  ticket_medio NUMERIC DEFAULT 0,
  receita_atribuida NUMERIC DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  mes_referencia TEXT,
  status TEXT DEFAULT 'Monitorar',
  roi NUMERIC DEFAULT 0,
  cac NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  payback NUMERIC DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- 9. Metas
CREATE TABLE metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor_meta NUMERIC NOT NULL,
  valor_realizado NUMERIC DEFAULT 0,
  periodo TEXT DEFAULT 'mensal',
  mes_referencia TEXT,
  ano INT,
  status TEXT DEFAULT 'em_andamento',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_agendamentos_user ON agendamentos(user_id);
CREATE INDEX idx_atendimentos_user ON atendimentos(user_id);
CREATE INDEX idx_clientes_user ON clientes(user_id);
CREATE INDEX idx_lancamentos_user ON lancamentos_financeiros(user_id);
```

---

## 📱 Fase 1.5: AUTENTICAÇÃO (Login/Register)

### Criar Páginas:
```jsx
src/pages/
├── Login.jsx       # Email + senha
├── Register.jsx    # Nome + email + senha + confirmar
├── ForgotPassword.jsx
└── ResetPassword.jsx
```

### Lógica:
```javascript
// Auth.jsx (Context)
import { createContext, useState } from 'react'
import { supabase } from '../supabase'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    })
    return { data, error }
  }

  const register = async (email, password, nome) => {
    const { data, error } = await supabase.auth.signUp({
      email, password
    })
    // Salvar nome em profissionais ou clientes
    return { data, error }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### ProtectedRoute:
```jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext)
  
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" />
  
  return children
}
```

---

## 💾 Fase 2: INTEGRAÇÃO DE DADOS (WEEK 2)

### 2.1 Hooks de Dados

```javascript
// src/hooks/useClientes.js
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClientes()
  }, [])

  async function fetchClientes() {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (err) throw err
      setClientes(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createCliente(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
    
    if (!error) setClientes([data[0], ...clientes])
    return { data, error }
  }

  async function updateCliente(id, updates) {
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (!error) {
      setClientes(clientes.map(c => c.id === id ? data[0] : c))
    }
    return { data, error }
  }

  async function deleteCliente(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    
    if (!error) setClientes(clientes.filter(c => c.id !== id))
    return { error }
  }

  return { clientes, loading, error, fetchClientes, createCliente, updateCliente, deleteCliente }
}
```

### Criar hooks para cada entidade:
```
src/hooks/
├── useClientes.js
├── useProfissionais.js
├── useServicos.js
├── useAgendamentos.js
├── useAtendimentos.js
├── useLancamentos.js
└── useCampanhas.js
```

### 2.2 Atualizar Páginas para Usar Dados Reais

```jsx
// pages/Clientes.jsx (ANTES - mock)
const [clients] = useState([...])

// pages/Clientes.jsx (DEPOIS - real)
const { clientes, loading, error, createCliente } = useClientes()

useEffect(() => {
  if (showNewModal && newClient) {
    createCliente(newClient)
  }
}, [showNewModal, newClient])
```

---

## 📅 Fase 3: MÓDULOS CRÍTICOS (WEEK 2-3)

### 3.1 Financeiro (/financeiro)

**Estrutura:**
```jsx
// pages/Financeiro.jsx
const { lancamentos } = useLancamentos()
const { atendimentos } = useAtendimentos()

// Calcular totais
const receitas = lancamentos
  .filter(l => l.tipo === 'receita' && isSameMonth(l.data, selectedMonth))
  .reduce((sum, l) => sum + l.valor, 0)

const despesas = lancamentos
  .filter(l => l.tipo === 'despesa' && isSameMonth(l.data, selectedMonth))
  .reduce((sum, l) => sum + l.valor, 0)

// DRE automático
const dre = {
  receita_bruta: receitas,
  custo_produtos: despesas * 0.3,
  comissoes: despesas * 0.15,
  margem: receitas - (despesas * 0.3) - (despesas * 0.15),
  custos_fixos: despesas * 0.2,
  lucro_liquido: receitas - despesas
}
```

### 3.2 Comissões (/comissoes)

**Tabela automática:**
```jsx
const profissionais = useProfissionais()
const atendimentos = useAtendimentos()

const comissoes = profissionais.map(prof => {
  const atsProf = atendimentos.filter(a => a.profissional_id === prof.id)
  const receita = atsProf.reduce((sum, a) => sum + a.valor_total, 0)
  const comissao = receita * (prof.comissao_percentual / 100)
  
  return { profissional: prof.nome, atendimentos: atsProf.length, receita, comissao }
})
```

### 3.3 Conciliação (/conciliacao)

**Validar lançamentos vs movimentos bancários**

---

## 🎯 Fase 4: FEATURES AVANÇADAS (WEEK 3+)

### 4.1 Exportação de PDFs
- DRE em PDF
- Relatório de Comissões
- Listagens

### 4.2 Importação de NF
- Upload PDF
- Extract com IA
- Atualizar estoque

### 4.3 Notificações
- Email (SendGrid)
- SMS (Twilio)
- Push (Firebase)

### 4.4 Relatórios
- Faturamento por período
- Top clientes
- Produtos mais vendidos

---

## ✅ Checklist Priorizado

### HOJE (Fase 1):
- [ ] Setup Supabase (/supabase.js)
- [ ] Criar tabelas SQL
- [ ] Autenticação (Login/Register)
- [ ] ProtectedRoute

### AMANHÃ (Fase 1.5):
- [ ] Hooks de CRUD (useClientes, useProfissionais, useServicos, etc)
- [ ] Integrar Dashboard com dados reais
- [ ] Integrar Clientes com dados reais
- [ ] Integrar Agendamento com dados reais

### SEMANA QUE VEM (Fase 2):
- [ ] Financeiro completo
- [ ] Comissões
- [ ] Conciliação
- [ ] Metas e Planejamento

### FINAL (Fase 3):
- [ ] PDFs
- [ ] Importação NF
- [ ] Email/SMS
- [ ] Deploy

---

## 🛠️ Como Começar

### 1. Supabase Setup
```bash
# Criar projeto em https://supabase.com
# Copiar .env
# Rodar SQL acima no editor do Supabase

npm install @supabase/supabase-js
```

### 2. Criar supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 3. Criar AuthContext
```jsx
// src/contexts/AuthContext.jsx
// (código acima)
```

### 4. Criar Hooks
```jsx
// src/hooks/useClientes.js
// (código acima)
```

### 5. Atualizar App
```jsx
// src/App.jsx
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          {/* ... */}
        </Route>
      </Routes>
    </AuthProvider>
  )
}
```

---

## 📈 Métricas de Sucesso

- ✅ Autenticação funcionando
- ✅ CRUD de clientes, profissionais, serviços
- ✅ Agendamentos salvando no BD
- ✅ Dashboard mostrando dados reais
- ✅ DRE calculando automaticamente
- ✅ Comissões atualizando em tempo real
- ✅ Deploy no Vercel/Netlify

---

**Vamos começar agora?** 🚀
