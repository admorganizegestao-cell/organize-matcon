import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  const str = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return v < 0 ? `(R$ ${str})` : `R$ ${str}`
}

const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function DestinacaoLucro({ competencia }) {
  const [dados, setDados] = useState(null)
  const [manuais, setManuais] = useState({})
  const [editando, setEditando] = useState(null)
  const [valorTemp, setValorTemp] = useState('')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [compId, setCompId] = useState(null)

  useEffect(() => { carregarDados() }, [competencia])

  async function carregarDados() {
    setLoading(true)
    setErro(null)

    const { data: comp } = await supabase
      .from('competencias').select('id')
      .eq('ano', competencia.ano).eq('mes', competencia.mes).maybeSingle()

    if (!comp) { setErro(`Competência ${competencia.mes}/${competencia.ano} não cadastrada.`); setLoading(false); return }
    setCompId(comp.id)

    const { data: dreContas } = await supabase.from('dre_contas').select('*').eq('ativo', true)
    const { data: dreLanc } = await supabase.from('dre_lancamentos').select('*').eq('competencia_id', comp.id)
    const dreMap = {}
    ;(dreLanc || []).forEach(l => { dreMap[l.conta_id] = parseFloat(l.valor || 0) })

    const { data: bpContas } = await supabase.from('bp_contas').select('*').eq('ativo', true)
    const { data: bpLanc } = await supabase.from('bp_lancamentos').select('*').eq('competencia_id', comp.id)
    const bpMap = {}
    ;(bpLanc || []).forEach(l => { bpMap[l.conta_id] = parseFloat(l.valor || 0) })

    const mesAnt = competencia.mes === 1 ? 12 : competencia.mes - 1
    const anoAnt = competencia.mes === 1 ? competencia.ano - 1 : competencia.ano
    const { data: compAnt } = await supabase.from('competencias').select('id')
      .eq('ano', anoAnt).eq('mes', mesAnt).maybeSingle()
    const bpMapAnt = {}
    if (compAnt) {
      const { data: bpLancAnt } = await supabase.from('bp_lancamentos').select('*').eq('competencia_id', compAnt.id)
      ;(bpLancAnt || []).forEach(l => { bpMapAnt[l.conta_id] = parseFloat(l.valor || 0) })
    }

    const getBP = (cod) => { const c = (bpContas||[]).find(c=>c.codigo===cod); return c ? (bpMap[c.id]||0) : 0 }
    const getBPAnt = (cod) => { const c = (bpContas||[]).find(c=>c.codigo===cod); return c ? (bpMapAnt[c.id]||0) : 0 }
    const getDRECod = (cod) => { const c = (dreContas||[]).find(c=>c.codigo===cod); return c ? (dreMap[c.id]||0) : 0 }

    const receitaBruta = (dreContas||[]).filter(c=>c.tipo==='receita').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const deducoes = (dreContas||[]).filter(c=>c.tipo==='deducao').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const receitaLiquida = receitaBruta - deducoes
    const cmv = getDRECod('3.01')+getDRECod('3.02')+getDRECod('3.03')-getDRECod('3.04')-getDRECod('3.05')
    const lucroBruto = receitaLiquida - cmv
    const gruposDespesa = ['DESPESAS ADMINISTRATIVAS','DESPESAS COM VENDAS','MARKETING','DESPESAS ESTRUTURAIS','ENTREGA / LOGÍSTICA','SEGURANÇA DO TRABALHO','SERVIÇOS DE TERCEIROS','TREINAMENTOS']
    const totalDespesas = gruposDespesa.reduce((acc,g)=>acc+(dreContas||[]).filter(c=>c.grupo===g).reduce((a,c)=>a+(dreMap[c.id]||0),0),0)
    const ebitda = lucroBruto - totalDespesas

    const varCR = getBP('A.04') - getBPAnt('A.04')
    const varEstoque = getBP('A.06') - getBPAnt('A.06')
    const varFornecedores = getBP('P.01') - getBPAnt('P.01')
    const caixaOperacional = ebitda - varCR - varEstoque + varFornecedores

    const manuaisSalvos = localStorage.getItem(`destinacao_manuais_${comp.id}`)
    const manuaisObj = manuaisSalvos ? JSON.parse(manuaisSalvos) : {}

    setDados({ ebitda, varCR, varEstoque, varFornecedores, caixaOperacional })
    setManuais(manuaisObj)
    setLoading(false)
  }

  function salvarManual(chave) {
    const valor = parseFloat(valorTemp.replace(',', '.')) || 0
    const novosManuais = { ...manuais, [chave]: valor }
    setManuais(novosManuais)
    localStorage.setItem(`destinacao_manuais_${compId}`, JSON.stringify(novosManuais))
    setEditando(null)
  }

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Calculando Destinação do Lucro...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  const { ebitda, varCR, varEstoque, varFornecedores, caixaOperacional } = dados
  const juros = manuais.juros || 0
  const ir = manuais.ir || 0
  const amortizacao = manuais.amortizacao || 0
  const imobilizado = manuais.imobilizado || 0
  const dividendos = manuais.dividendos || 0
  const outrasVariacoes = manuais.outrasVariacoes || 0
  const variacaoRealCaixa = caixaOperacional - juros - ir - amortizacao - imobilizado - dividendos + outrasVariacoes

  const manuaisLinhas = [
    { chave: 'juros', label: 'Juros pagos', icone: '💳', sinal: -1 },
    { chave: 'ir', label: 'IR/CS pagos', icone: '🏛️', sinal: -1 },
    { chave: 'amortizacao', label: 'Amortização de empréstimos', icone: '🏦', sinal: -1 },
    { chave: 'imobilizado', label: 'Aquisição de imobilizado', icone: '🏗️', sinal: -1 },
    { chave: 'dividendos', label: 'Dividendos distribuídos', icone: '💰', sinal: -1 },
    { chave: 'outrasVariacoes', label: 'Outras variações de caixa', icone: '↕️', sinal: 1 },
  ]

  const dadosWaterfall = [
    { name: 'EBITDA', valor: ebitda, cor: '#00A651' },
    { name: '▲ CR', valor: -varCR, cor: varCR > 0 ? '#F04545' : '#00A651' },
    { name: '▲ Estoque', valor: -varEstoque, cor: varEstoque > 0 ? '#F04545' : '#00A651' },
    { name: '▲ Fornec.', valor: varFornecedores, cor: varFornecedores > 0 ? '#00A651' : '#F04545' },
    { name: 'Cx. Op.', valor: caixaOperacional, cor: '#3B82F6' },
    { name: 'Juros', valor: -juros, cor: '#F04545' },
    { name: 'IR/CS', valor: -ir, cor: '#F04545' },
    { name: 'Amort.', valor: -amortizacao, cor: '#F04545' },
    { name: 'Imob.', valor: -imobilizado, cor: '#F04545' },
    { name: 'Div.', valor: -dividendos, cor: '#F04545' },
    { name: 'Variação', valor: variacaoRealCaixa, cor: variacaoRealCaixa >= 0 ? '#00A651' : '#F04545' },
  ]

  const tooltipStyle = { background: '#101828', border: '1px solid #1C2A40', borderRadius: '6px', color: '#E8EDF5', fontSize: '12px' }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Destinação do Lucro</h2>
          <div style={{ fontSize: '13px', color: 'var(--textSub)' }}>{meses[competencia.mes - 1]}/{competencia.ano} — Reconciliação EBITDA → Caixa Real</div>
        </div>
        <button onClick={() => window.print()}
          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
          🖨️ PDF
        </button>
      </div>

      {/* CARDS TOPO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '11px', marginBottom: '24px' }}>
        <CardTopo label="EBITDA do Mês" valor={ebitda} cor="var(--verde)" icone="📊" />
        <CardTopo label="Caixa Operacional" valor={caixaOperacional} cor="var(--accent)" icone="⚙️" />
        <CardTopo label="Variação Real de Caixa" valor={variacaoRealCaixa} cor={variacaoRealCaixa >= 0 ? 'var(--verde)' : 'var(--danger)'} icone="💵" />
      </div>

      {/* LAYOUT DUAS COLUNAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* COLUNA ESQUERDA — TABELA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Bloco automático */}
          <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px' }}>RECONCILIAÇÃO AUTOMÁTICA</span>
              <span style={{ fontSize: '10px', background: 'var(--verdeDim)', color: 'var(--verde)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--verde)' }}>auto</span>
            </div>
            <LinhaBloco label="(=) EBITDA do mês" valor={ebitda} cor="var(--verde)" bold />
            <LinhaBloco label="(-) Variação de Contas a Receber" valor={-varCR} cor="var(--warning)" />
            <LinhaBloco label="(-) Variação de Estoques" valor={-varEstoque} cor="var(--warning)" />
            <LinhaBloco label="(+) Variação de Fornecedores" valor={varFornecedores} cor="var(--accent)" />
            <div style={{ background: 'rgba(59,130,246,0.07)', borderTop: '2px solid var(--accent)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>(=) CAIXA OPERACIONAL</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '16px', color: caixaOperacional >= 0 ? 'var(--verde)' : 'var(--danger)' }}>{fmt(caixaOperacional)}</span>
            </div>
          </div>

          {/* Bloco manual */}
          <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px' }}>CONSUMO DO CAIXA — MANUAL</span>
            </div>
            {manuaisLinhas.map(l => {
              const valor = manuais[l.chave] || 0
              const valorExibir = valor * l.sinal
              const isEdit = editando === l.chave
              return (
                <div key={l.chave} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)', gap: '12px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '16px' }}>{l.icone}</span>
                  <span style={{ flex: 1, color: 'var(--textSub)', fontSize: '13px' }}>{l.sinal === -1 ? '(-) ' : '(+/-) '}{l.label}</span>
                  {isEdit ? (
                    <span style={{ display: 'flex', gap: '6px' }}>
                      <input autoFocus value={valorTemp} onChange={e => setValorTemp(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') salvarManual(l.chave); if (e.key === 'Escape') setEditando(null) }}
                        style={{ background: 'var(--card)', border: '1px solid var(--verde)', borderRadius: '4px', color: 'var(--text)', padding: '4px 8px', fontSize: '13px', width: '110px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
                      <button onClick={() => salvarManual(l.chave)} style={{ background: 'var(--verde)', border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                      <button onClick={() => setEditando(null)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--textSub)', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: valorExibir >= 0 ? 'var(--text)' : 'var(--danger)', minWidth: '90px', textAlign: 'right' }}>
                        {valor > 0 ? fmt(valorExibir) : '—'}
                      </span>
                      <button onClick={() => { setEditando(l.chave); setValorTemp(valor ? String(valor) : '') }}
                        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--textSub)', padding: '3px 10px', cursor: 'pointer', fontSize: '11px' }}>
                        editar
                      </button>
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Resultado final */}
          <div style={{ background: variacaoRealCaixa >= 0 ? 'rgba(0,166,81,0.07)' : 'rgba(240,69,69,0.07)', borderRadius: '8px', border: `2px solid ${variacaoRealCaixa >= 0 ? 'var(--verde)' : 'var(--danger)'}`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>RESULTADO FINAL</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>(=) VARIAÇÃO REAL DE CAIXA</div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '26px', color: variacaoRealCaixa >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
              {fmt(variacaoRealCaixa)}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA — GRÁFICO */}
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>CASCATA — DO EBITDA AO CAIXA REAL</div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosWaterfall} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fill: '#6B7FA3', fontSize: 10 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#101828', border: '1px solid #1C2A40', borderRadius: '6px', color: '#E8EDF5', fontSize: '12px' }} formatter={(v) => fmt(v)} />
              <Bar dataKey="valor" radius={[4,4,0,0]}>
                {dadosWaterfall.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function CardTopo({ label, valor, cor, icone }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', borderTop: `3px solid ${cor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '0.5px' }}>{label}</div>
        <span style={{ fontSize: '18px' }}>{icone}</span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '20px', color: cor }}>{fmt(valor)}</div>
    </div>
  )
}

function LinhaBloco({ label, valor, cor, bold }) {
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: bold ? 'var(--text)' : 'var(--textSub)', fontSize: '13px', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: valor >= 0 ? 'var(--text)' : 'var(--danger)', fontWeight: bold ? 700 : 400 }}>{fmt(valor)}</span>
    </div>
  )
}