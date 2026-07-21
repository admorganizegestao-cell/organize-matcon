# 🚀 Setup Supabase - Guia Rápido

## Passo 1: Criar Projeto Supabase

1. Acesse https://supabase.com
2. Clique "Start your project"
3. Crie uma conta ou faça login
4. Clique "New Project"
5. Preencha:
   - **Name:** organize-matcon
   - **Password:** (gere uma forte)
   - **Region:** Brazil (São Paulo) ou US
6. Clique "Create new project" e aguarde (5-10 min)

## Passo 2: Copiar Credentials

1. No painel do Supabase, vá para **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Passo 3: Criar .env.local

Na raiz do projeto, crie `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

**NÃO commite este arquivo!** (já está no .gitignore)

## Passo 4: Criar Tabelas (SQL)

1. No Supabase, vá para **SQL Editor**
2. Clique "+ New Query"
3. Cole o SQL abaixo:

```sql
-- 1. CLIENTES
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_nascimento DATE,
  observacoes TEXT,
  total_visitas INT DEFAULT 0,
  origem TEXT DEFAULT 'Indicação',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. PROFISSIONAIS
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. SERVIÇOS
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 4. AGENDAMENTOS
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  cliente_nome TEXT,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE NOT NULL,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 5. ATENDIMENTOS
CREATE TABLE atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  cliente_nome TEXT,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE NOT NULL,
  profissional_nome TEXT,
  agendamento_id UUID REFERENCES agendamentos(id),
  itens JSONB DEFAULT '[]',
  valor_total NUMERIC DEFAULT 0,
  comissao_valor NUMERIC DEFAULT 0,
  forma_pagamento TEXT,
  data TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'concluido',
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 6. LANÇAMENTOS FINANCEIROS
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 7. CAMPANHAS
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- 8. METAS
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- ÍNDICES para performance
CREATE INDEX idx_clientes_user ON clientes(user_id);
CREATE INDEX idx_profissionais_user ON profissionais(user_id);
CREATE INDEX idx_servicos_user ON servicos(user_id);
CREATE INDEX idx_agendamentos_user ON agendamentos(user_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_hora);
CREATE INDEX idx_atendimentos_user ON atendimentos(user_id);
CREATE INDEX idx_lancamentos_user ON lancamentos_financeiros(user_id);
CREATE INDEX idx_lancamentos_data ON lancamentos_financeiros(data);
CREATE INDEX idx_campanhas_user ON campanhas(user_id);
CREATE INDEX idx_metas_user ON metas(user_id);

-- ENABLE RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

-- POLICIES (cada usuário vê apenas seus dados)
CREATE POLICY "Clientes - users can only see their own" ON clientes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Clientes - users can insert their own" ON clientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Clientes - users can update their own" ON clientes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Clientes - users can delete their own" ON clientes
  FOR DELETE USING (auth.uid() = user_id);

-- (Repetir policies para outras tabelas...)
```

4. Clique "Run" e aguarde

## Passo 5: Testar Autenticação

1. No Supabase, vá para **Authentication → Users**
2. Clique "Add user"
3. Preencha email e senha
4. Crie um usuário de teste

## Passo 6: Rodar Localmente

```bash
# Instalar dependências
npm install

# Rodar em dev
npm run dev

# Acessa http://localhost:5173
```

## Passo 7: Testar Login

1. Use o email/senha criado no passo 5
2. Se funcionar, você entra no Dashboard
3. Teste criar um cliente

---

## ✅ Checklist de Setup

- [ ] Projeto criado em Supabase
- [ ] `.env.local` com credentials
- [ ] Tabelas criadas (SQL rodado)
- [ ] Autenticação testada
- [ ] Login funcionando
- [ ] Consegue criar cliente
- [ ] Dados aparecem em tempo real

---

## 🐛 Troubleshooting

### "Supabase credentials not found"
- Crie `.env.local` com as variáveis corretas
- Restart o servidor (`npm run dev`)

### Erro ao criar cliente
- Verifique se você está logado
- Veja console (F12) para erros
- Tente criar um cliente simples (só nome)

### Tabelas não aparecem
- No Supabase, vá para **Database → Tables**
- Se não ver as tabelas, rode o SQL novamente
- Copie/cole cada tabela de uma vez (melhor que tudo junto)

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [SQL Examples](https://supabase.com/docs/guides/database)

---

**Pronto!** Agora você tem backend completo com autenticação e banco de dados. 🎉
