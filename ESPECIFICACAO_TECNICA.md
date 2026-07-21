# 📋 Especificação Técnica - Salão 360

Especificação 100% fiel para reprodução e continuação da implementação.

---

## 1. VISÃO GERAL

**Nome:** Salão 360 (BelezaGestão Pro)  
**Objetivo:** Sistema completo de gestão para salões de beleza de porte médio  
**Idioma:** Português brasileiro (pt-BR)  
**Tema:** Dark mode permanente  
**Stack:** React + Tailwind CSS v4 + JavaScript (Vite)  
**Responsividade:** Mobile + Desktop  

---

## 2. DESIGN SYSTEM

### 2.1 Cores (CSS Variables - HSL)

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| --background | 240 10% 6% | #0E0E10 | Fundo principal |
| --foreground | 220 14% 96% | #F5F6F7 | Texto principal |
| --card | 230 15% 12% | #1A1B1F | Cards e containers |
| --primary | 322 81% 56% | #E040A0 | Rosa/magenta - marca |
| --secondary | 230 14% 16% | #25262B | Elementos secundários |
| --muted | 230 14% 16% | #25262B | Fundos muted |
| --muted-foreground | 220 10% 60% | #8E8E98 | Texto secundário |
| --accent | 322 81% 56% | #E040A0 | Mesmo que primary |
| --destructive | 0 84% 60% | #EF4444 | Erros/exclusão |
| --border | 230 14% 20% | #2E2F35 | Bordas |
| --input | 230 14% 20% | #2E2F35 | Bordas de inputs |
| --ring | 322 81% 56% | #E040A0 | Focus ring |
| --sidebar-bg | 230 18% 9% | #121318 | Fundo da sidebar |
| --success | 142 71% 45% | #22C55E | Verde - sucesso |
| --danger | 0 84% 60% | #EF4444 | Vermelho - erro |
| --warning | 38 92% 50% | #F59E0B | Amarelo - alertas |

### 2.2 Fonte

- **Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800
- **Heading:** Inter 600-700
- **Body:** Inter 400-500
- **Display:** Inter 800

### 2.3 Border Radius

- **lg:** 10px (0.625rem)
- **md:** 8px
- **sm:** 6px

### 2.4 Charts (Recharts)

```javascript
const chartColors = {
  chart1: '#E040A0',  // Rosa
  chart2: '#22C55E',  // Verde
  chart3: '#3B82F6',  // Azul
  chart4: '#F59E0B',  // Amarelo
  chart5: '#EA580C'   // Laranja
}
```

### 2.5 Gradientes Customizados

```css
.gradient-primary: from-[#E040A0] to-[#9333EA]
.gradient-success: from-[#22C55E] to-[#16A34A]
.gradient-warning: from-[#F59E0B] to-[#D97706]
```

---

## 3. ENTIDADES (Banco de Dados)

### 3.1 Cliente

```javascript
{
  id: string,
  nome: string (required),
  telefone: string,
  email: string,
  data_nascimento: date,
  observacoes: string,
  total_visitas: number (default: 0),
  origem: enum ['Indicação', 'Instagram', 'Google', 'Rádio', 'Outdoor', 'WhatsApp', 'Local', 'Outros'],
  criado_em: timestamp,
  atualizado_em: timestamp
}
```

### 3.2 Profissional

```javascript
{
  id: string,
  nome: string (required),
  telefone: string,
  email: string,
  tipo: enum ['CLT', 'Autônomo'] (required),
  comissao_percentual: number (default: 0),
  cargo: enum ['Cabeleireiro', 'Barbeiro', 'Manicure', 'Esteticista', 'Maquiador', 'Outros'],
  ativo: boolean (default: true),
  cor: string (default: '#E040A0'),
  user_id: string,
  criado_em: timestamp
}
```

### 3.3 Serviço

```javascript
{
  id: string,
  nome: string (required),
  categoria: enum ['Cabelo', 'Barba', 'Unhas', 'Estética', 'Maquiagem', 'Outros'],
  tempo_minutos: number (default: 30),
  custo_produto: number (default: 0),
  preco_venda: number (required),
  margem_percentual: number (default: 0),
  comissao_percentual: number (default: 0),
  descricao: string,
  ativo: boolean (default: true),
  criado_em: timestamp
}
```

### 3.4 Combo

```javascript
{
  id: string,
  nome: string (required),
  descricao: string,
  servicos: array[{
    servico_id: string,
    nome: string,
    preco_original: number
  }],
  preco_original: number (default: 0),
  desconto_percentual: number (default: 0),
  preco_final: number (required),
  tempo_total_minutos: number (default: 0),
  ativo: boolean (default: true),
  criado_em: timestamp
}
```

### 3.5 Produto (Estoque)

```javascript
{
  id: string,
  nome: string (required),
  categoria: enum ['Shampoo', 'Condicionador', 'Tintura', 'Tratamento', 'Manicure', 'Estética', 'Acessório', 'Outros'],
  unidade: enum ['un', 'ml', 'L', 'g', 'kg'],
  custo_unitario: number (required),
  preco_venda: number (default: 0),
  estoque_atual: number (default: 0),
  estoque_minimo: number (default: 0),
  fornecedor: string,
  ativo: boolean (default: true),
  criado_em: timestamp
}
```

### 3.6 ProdutoEstoque (Movimentações)

```javascript
{
  id: string,
  produto_id: string (required),
  produto_nome: string,
  tipo: enum ['entrada', 'saida'] (required),
  quantidade: number (required),
  valor_unitario: number (default: 0),
  data: date (required),
  motivo: enum ['compra', 'consumo', 'venda', 'perda', 'ajuste'],
  atendimento_id: string,
  observacoes: string,
  criado_em: timestamp
}
```

### 3.7 Agendamento

```javascript
{
  id: string,
  cliente_id: string (required),
  cliente_nome: string,
  profissional_id: string (required),
  profissional_nome: string,
  tipo: enum ['servico', 'combo'],
  servico_id: string,
  servico_nome: string,
  combo_id: string,
  combo_nome: string,
  data_hora: datetime (required),
  duracao_minutos: number (default: 30),
  valor: number (default: 0),
  comissao_percentual: number (default: 0),
  status: enum ['agendado', 'confirmado', 'realizado', 'cancelado', 'no_show'],
  observacoes: string,
  recorrente: boolean (default: false),
  ciclo_dias: number (dias entre repetições, null se não recorrente),
  agendamento_pai_id: string (referência ao agendamento original),
  criado_em: timestamp
}
```

### 3.8 Atendimento

```javascript
{
  id: string,
  cliente_id: string (required),
  cliente_nome: string,
  profissional_id: string (required),
  profissional_nome: string,
  agendamento_id: string,
  itens: array[{
    tipo: 'servico' | 'combo',
    item_id: string,
    nome: string,
    valor: number,
    comissao_percentual: number
  }],
  valor_total: number (default: 0),
  comissao_valor: number (default: 0),
  forma_pagamento: enum ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Vale'],
  data: datetime (required),
  status: enum ['concluido', 'pendente_pagamento', 'cancelado'],
  observacoes: string,
  criado_em: timestamp
}
```

### 3.9 LancamentoFinanceiro

```javascript
{
  id: string,
  tipo: enum ['receita', 'despesa'] (required),
  categoria: string,
  descricao: string (required),
  valor: number (required),
  data: date (required),
  forma_pagamento: enum ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Transferência', 'Boleto'],
  atendimento_id: string,
  conta_bancaria_id: string,
  conciliado: boolean (default: false),
  movimento_bancario_id: string,
  recorrente: boolean (default: false),
  criado_em: timestamp
}
```

### 3.10 ContaBancaria

```javascript
{
  id: string,
  nome: string (required),
  banco: string (required),
  agencia: string,
  conta: string,
  saldo_inicial: number (default: 0),
  saldo_atual: number (default: 0),
  ativo: boolean (default: true),
  criado_em: timestamp
}
```

### 3.11 MovimentoBancario

```javascript
{
  id: string,
  conta_bancaria_id: string (required),
  data: date (required),
  descricao: string (required),
  valor: number (required),
  tipo: enum ['credito', 'debito'] (required),
  conciliado: boolean (default: false),
  lancamento_financeiro_id: string,
  documento: string,
  criado_em: timestamp
}
```

### 3.12 Campanha (Marketing)

```javascript
{
  id: string,
  nome: string (required),
  canal: enum ['Rádio', 'Outdoor', 'Instagram', 'WhatsApp', 'Indicação', 'Parcerias', 'Google', 'Local-Outros'],
  investimento: number (required),
  clientes_gerados: number (default: 0),
  ticket_medio: number (default: 0),
  receita_atribuida: number (default: 0),
  data_inicio: date,
  data_fim: date,
  mes_referencia: string (YYYY-MM),
  como_rastreou: string,
  status: enum ['Escalar', 'Monitorar', 'Pausar'],
  acao_recomendada: string,
  roi: number (default: 0),
  cac: number (default: 0),
  ltv: number (default: 0),
  payback: number (default: 0),
  criado_em: timestamp
}
```

### 3.13 Meta

```javascript
{
  id: string,
  titulo: string (required),
  tipo: enum ['receita', 'atendimentos', 'ticket_medio', 'novos_clientes', 'roi_marketing', 'reducao_custo'],
  valor_meta: number (required),
  valor_realizado: number (default: 0),
  periodo: enum ['mensal', 'trimestral', 'anual'],
  mes_referencia: string (YYYY-MM),
  ano: number,
  status: enum ['em_andamento', 'atingida', 'atrasada'],
  criado_em: timestamp
}
```

### 3.14 Tarefa

```javascript
{
  id: string,
  titulo: string (required),
  descricao: string,
  responsavel: string,
  prazo: date,
  status: enum ['pendente', 'em_andamento', 'concluida'],
  prioridade: enum ['baixa', 'media', 'alta'],
  modulo_origem: enum ['planejamento', 'marketing', 'financeiro', 'estoque', 'operacional'],
  criado_em: timestamp
}
```

### 3.15 Configuracao

```javascript
{
  id: string,
  margem_bruta_media: number (default: 0.3),
  frequencia_compra_mensal: number (default: 1.5),
  meses_relacionamento_medio: number (default: 18),
  cac_meta: number (default: 80),
  ltv_meta_min: number (default: 400),
  roi_meta_min: number (default: 250),
  nome_salao: string (required, default: 'Salão 360'),
  atualizado_em: timestamp
}
```

---

## 4. PÁGINAS E FLUXOS

### 4.1 Dashboard (/)

**Dados Carregados:**
- Todos os Atendimentos do dia
- LancamentoFinanceiro (receitas + despesas)
- Campanhas
- Produtos (com estoque baixo)
- Agendamentos
- Metas

**Componentes:**
```jsx
<PageHeader />
<AlertPagamentosPendentes />  // ← NOVO: Alerta visível
<AlertEstoqueBaixo />
<Grid cols={4}>
  <StatCard receita-hoje />
  <StatCard caixa-hoje />
  <StatCard agendamentos />
  <StatCard estoque-baixo />
</Grid>
<Grid cols={3} lg:cols-2>
  <ChartReeitaVsMeta />
  <AgendaHoje />
</Grid>
<Grid cols={2}>
  <ChartROICanal />
  <AlertasEstoque />
</Grid>
```

### 4.2 Agendamento (/agendamento)

**Seletor de Data:**
- Botões de navegação (← Anterior | Data | Próximo →)
- Mostra número de agendamentos do dia

**Grade Visual:**
- Colunas: Profissionais ativos
- Linhas: Horários 8h-20h (slots de 1h)
- Altura de slot: 48px
- Cards coloridos por status

**Modal Novo Agendamento:**
```jsx
<Select>Cliente</Select>
<Select>Profissional</Select>
<Input type="date" />
<Select>Hora</Select>
<Toggle>Serviço / Combo</Toggle>
<Select>Serviço ou Combo</Select>

// ← NOVO: Recorrência Personalizada
<Select>
  <option>Não repetir</option>
  <option>Semanalmente</option>
  <option>A cada 2 semanas</option>
  <option>Mensalmente</option>
  <option>Personalizar...</option>
</Select>

{recurringType === 'custom' && (
  <Input 
    type="number" 
    label="Duração do Ciclo (semanas)"
    min="1" 
    max="52"
    placeholder="Ex: 4"
  />
)}

{recurringType !== 'none' && (
  <Select>
    <option>4 semanas</option>
    <option>8 semanas</option>
    <option>12 semanas</option>
    <option>26 semanas</option>
    <option>52 semanas</option>
  </Select>
)}

<Textarea>Observações</Textarea>
```

**Lógica de Recorrência:**
```javascript
function criarAgendamentosRecorrentes(agendamento, semanas, repeticoes) {
  const agendamentos = [agendamento]
  const cicloDias = semanas * 7
  
  for (let i = 1; i < repeticoes; i++) {
    const novaData = addDays(agendamento.data_hora, cicloDias * i)
    agendamentos.push({
      ...agendamento,
      id: generateId(),
      data_hora: novaData,
      agendamento_pai_id: agendamento.id
    })
  }
  
  return agendamentos
}
```

### 4.3 Financeiro (/financeiro)

**Abas:**
- Fluxo de Caixa (lista de lançamentos)
- DRE (demonstrativo)
- Inadimplência (pagamentos pendentes)

**DRE Estrutura:**
```
(+) Receita de Serviços
(+) Outras Receitas
(=) Receita Bruta [separator]
(-) Custo de Produtos/Insumos
(-) Comissões
(=) Margem de Contribuição [separator]
(-) Custos Fixos
(=) Lucro Líquido [separator, colorido]
Margem Líquida (%)
```

**Gráficos:**
- AreaChart: Receita vs Custo (6 meses)
- BarChart: Despesas por categoria

### 4.4 Estoque (/estoque)

**Abas:**
- Produtos
- Movimentações

**Aba Produtos (Tabela):**
```
| Produto | Categoria | Custo | Estoque | Status | Ações |
```

**Modal Importar NF:**
```jsx
<Upload type="application/pdf" />
// Extrai: fornecedor, data, itens[]
<List>
  {itens.map(item => (
    <Row>
      <Checkbox />
      <Select label="Vincular a Produto" options={produtos} />
      {item.descricao} - {item.qtd} x {item.valor_unitario}
    </Row>
  ))}
</List>
```

### 4.5 Marketing (/marketing)

**Componentes:**
```jsx
<Grid cols={4}>
  <StatCard investimento-total />
  <StatCard receita-atribuida />
  <StatCard roi-geral />
  <StatCard clientes-gerados />
</Grid>

<ChartBarHorizontal data={campanhas} y="channel" x="roi" />

<Filter mes={mes} onChange={setMes} />

<Grid cols={2}>
  {campanhas.map(camp => (
    <CardCampanha>
      <Ícone canal />
      <h3>{camp.nome}</h3>
      <p>{camp.canal} • {camp.mes}</p>
      
      <Grid cols={2} gap={2}>
        <MiniCard investimento />
        <MiniCard receita />
        <MiniCard cac />
        <MiniCard ltv />
      </Grid>
      
      <Footer>
        <ROI colorido />
        <Badge status />
      </Footer>
      
      <Buttons edit delete />
    </CardCampanha>
  ))}
</Grid>
```

### 4.6 FPA (/fpa)

**Estrutura:**
```jsx
<ChartArea 
  data={[
    { mes, realizado, orcado },
    ...
  ]}
/>

<ChartLine 
  yAxisId="left" data={ticketMedio}
  yAxisId="right" data={nAtendimentos}
/>

<MetasList>
  {metas.map(meta => (
    <MetaItem>
      <Icon target />
      <Título>{meta.titulo}</Título>
      <Tipo período />
      <ProgressBar percentual />
      <Badge status />
    </MetaItem>
  ))}
</MetasList>
```

### 4.7 Conciliação (/conciliacao)

**Seletor de Contas:**
```jsx
<Pills>
  {contas.map(conta => (
    <Pill 
      className={ativo ? 'bg-primary' : ''}
      onClick={() => setContaSelecionada(conta.id)}
    >
      {conta.banco} — {conta.nome}
    </Pill>
  ))}
</Pills>
```

**Lista de Movimentos:**
```jsx
{movimentos.map(mov => (
  <MovimentoItem>
    <Icon check={conciliado} alertCircle={!conciliado} />
    <Descrição>
      <p>{mov.descricao}</p>
      <Metadados>{mov.data} • {mov.documento}</Metadados>
    </Descrição>
    <Valor className={mov.tipo === 'credito' ? 'text-success' : 'text-danger'}>
      {fmtCurrency(mov.valor)}
    </Valor>
    {!conciliado && (
      <Select 
        label="Vincular Lançamento"
        options={lancamentosNaoConciliados}
        onChange={(lance) => conciliar(mov, lance)}
      />
    )}
  </MovimentoItem>
))}
```

### 4.8 Comissões (/comissoes)

**Tabela:**
```
| Profissional | Atendimentos | Receita Gerada | % Comissão | Comissão (R$) |
| Avatar Nome Tipo | X | R$ | 15% | R$ |
```

### 4.9 Planejamento (/planejamento)

**Seções:**
```jsx
<OKRs>
  {metas.map(meta => (
    <MetaCard>
      <h3>{meta.titulo}</h3>
      <ProgressBar />
      <Semáforo status={meta.progress >= 100 ? 'verde' : meta.progress >= 70 ? 'amarelo' : 'vermelho'} />
    </MetaCard>
  ))}
</OKRs>

<SWOT>
  <Card title="Forças" icon={CheckCircle2} className="border-success">
    <List>
      <Item onDelete />
    </List>
    <Input placeholder="Adicionar..." />
  </Card>
  // Fraquezas, Oportunidades, Ameaças
</SWOT>

<PlanoAcao>
  <Counters
    atrasadas={taskcount}
    pendentes={taskcount}
    concluidas={taskcount}
  />
  
  <List>
    {tarefas.map(task => (
      <TaskItem>
        <Checkbox />
        <Ícone prioridade />
        <Título>{task.titulo}</Título>
        <Metadados>{task.responsavel} • {fmtDate(task.prazo)}</Metadados>
        <Badge modulo />
        <Badge prioridade />
      </TaskItem>
    ))}
  </List>
</PlanoAcao>
```

---

## 5. FLUXOS AUTOMÁTICOS

### 5.1 Realizar Atendimento

```javascript
function realizarAtendimento(agendamentoId, formaPagamento, recebidoAgora) {
  const agendamento = getAgendamento(agendamentoId)
  
  // 1. Cria Atendimento
  const atendimento = {
    cliente_id: agendamento.cliente_id,
    profissional_id: agendamento.profissional_id,
    agendamento_id: agendamentoId,
    itens: [{
      tipo: agendamento.tipo,
      item_id: agendamento.servico_id || agendamento.combo_id,
      nome: agendamento.servico_nome || agendamento.combo_nome,
      valor: agendamento.valor,
      comissao_percentual: agendamento.comissao_percentual
    }],
    valor_total: agendamento.valor,
    comissao_valor: (agendamento.valor * agendamento.comissao_percentual) / 100,
    forma_pagamento: formaPagamento,
    data: now(),
    status: recebidoAgora ? 'concluido' : 'pendente_pagamento'
  }
  
  const atendimentoId = createAtendimento(atendimento)
  
  // 2. Se recebido agora: cria lançamentos
  if (recebidoAgora) {
    // Receita
    createLancamento({
      tipo: 'receita',
      categoria: 'Serviços',
      descricao: `Atendimento ${atendimento.cliente_id}`,
      valor: atendimento.valor_total,
      data: today(),
      forma_pagamento: formaPagamento,
      atendimento_id: atendimentoId,
      conciliado: formaPagamento === 'Dinheiro'
    })
    
    // Comissão (despesa)
    if (atendimento.comissao_valor > 0) {
      createLancamento({
        tipo: 'despesa',
        categoria: 'Comissões',
        descricao: `Comissão ${agendamento.profissional_nome}`,
        valor: atendimento.comissao_valor,
        data: today(),
        forma_pagamento: 'Transferência',
        atendimento_id: atendimentoId
      })
    }
  }
  
  // 3. Atualiza agendamento
  updateAgendamento(agendamentoId, {
    status: 'realizado'
  })
}
```

### 5.2 Alertar Pagamentos Pendentes

```javascript
// Dashboard renderiza automaticamente
const pendingPayments = atendimentos
  .filter(a => a.status === 'pendente_pagamento')
  .sort((a, b) => new Date(a.data) - new Date(b.data))

if (pendingPayments.length > 0) {
  return <AlertPagamentosPendentes items={pendingPayments} />
}
```

### 5.3 Cálculos de Marketing (Automáticos)

```javascript
function calcularMetricasCampanha(campanha) {
  const config = getConfiguracao()
  
  campanha.roi = calcROI(campanha.receita_atribuida, campanha.investimento)
  campanha.cac = calcCAC(campanha.investimento, campanha.clientes_gerados)
  campanha.ltv = calcLTV(
    campanha.ticket_medio,
    config.frequencia_compra_mensal,
    config.meses_relacionamento_medio
  )
  campanha.payback = calcPayback(
    campanha.cac,
    campanha.ticket_medio,
    config.margem_bruta_media * 100
  )
  
  // Status automático
  if (campanha.roi >= config.roi_meta_min && campanha.cac <= config.cac_meta) {
    campanha.status = 'Escalar'
  } else if (campanha.roi < 0 || campanha.cac > config.cac_meta * 2) {
    campanha.status = 'Pausar'
  } else {
    campanha.status = 'Monitorar'
  }
  
  return campanha
}
```

---

## 6. VALIDAÇÕES E REGRAS DE NEGÓCIO

### Agendamento
- ✓ Cliente obrigatório
- ✓ Profissional obrigatório
- ✓ Data/hora obrigatória
- ✓ Serviço ou Combo obrigatório
- ✓ Duração mínima: 30 minutos
- ✓ Não pode agendar no passado
- ✓ Não pode ter 2 agendamentos no mesmo slot para mesmo profissional
- ✓ Ciclo recorrente: 1-52 semanas
- ✓ Máximo 52 agendamentos recorrentes por solicitação

### Atendimento
- ✓ Status imediato: concluido (se pago) ou pendente_pagamento
- ✓ Comissão não pode exceder 50%
- ✓ Valor mínimo: R$ 0,01

### Estoque
- ✓ Quantidade não pode ser negativa
- ✓ Alerta se estoque_atual <= estoque_minimo
- ✓ Custo não pode ser negativo

### Campanha
- ✓ Investimento não pode ser negativo
- ✓ CAC = 0 se clientes_gerados = 0
- ✓ ROI automático calculado
- ✓ Status automático conforme meta

---

## 7. INTEGRAÇÕES PLANEJADAS

### Supabase
- Autenticação (JWT)
- CRUD de todas as entidades
- Webhooks para notificações
- Storage para uploads de PDF

### Email
- Confirmação de agendamento
- Lembrete 24h antes
- Recibos de atendimento
- Relatórios mensais

### SMS/WhatsApp
- Confirmação de agendamento
- Lembrete do dia
- Notificação de pagamento recebido

### PDFs
- DRE
- Fluxo de Caixa
- Relatório de Comissões
- Relatório de Marketing

---

## 8. SEGURANÇA

- ✓ Autenticação obrigatória
- ✓ Autorização por role (admin, profissional, gerenciador)
- ✓ Dados sensíveis não logados
- ✓ Rate limiting em APIs
- ✓ HTTPS obrigatório
- ✓ CORS configurado
- ✓ SQL Injection prevenido (Supabase)

---

## 9. PERFORMANCE

- ✓ Code-splitting por rota
- ✓ Lazy loading de imagens
- ✓ Caching de dados imutáveis
- ✓ Paginação em listas grandes
- ✓ Debounce em buscas
- ✓ Memoização de componentes pesados

---

## 10. ACESSIBILIDADE

- ✓ ARIA labels em elementos interativos
- ✓ Contraste mínimo 4.5:1
- ✓ Navegação por teclado
- ✓ Ícones + texto em botões críticos
- ✓ Feedback visual para interações
- ✓ Links com contexto claro

---

**Documento criado:** 2024  
**Versão:** 1.0  
**Status:** Pronto para implementação
