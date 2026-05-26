import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

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

  const corValor = (v) => v >= 0 ? 'var(--verde)' : 'var(--danger)'
  const barWidth = (v, max) => max === 0 ? 0 : Math.min(Math.abs(v) / Math.abs(max) * 100, 100)
  const maxVal = Math.max(Math.abs(ebitda), Math.abs(caixaOperacional), Math.abs(variacaoRealCaixa), 1)

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            Destinação do Lucro
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--textSub)' }}>
            {meses[competencia.mes - 1]}/{competencia.ano} — Reconciliação EBITDA → Caixa Real
          </div>
        </div>
        <button onClick={() => window.print()}
          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
          🖨️ PDF
        </button>
      </div>

      {/* CARDS TOPO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '11px', marginBottom: '28px' }}>
        <CardTopo label="EBITDA do Mês" valor={ebitda} cor="var(--verde)" icone="📊" />
        <CardTopo label="Caixa Operacional" valor={caixaOperacional} cor="var(--accent)" icone="⚙️" />
        <CardTopo label="Variação Real de Caixa" valor={variacaoRealCaixa} cor={variacaoRealCaixa >= 0 ? 'var(--verde)' : 'var(--danger)'} icone="💵" />
      </div>

      {/* BLOCO AUTOMÁTICO */}
      <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px' }}>RECONCILIAÇÃO AUTOMÁTICA</span>
          <span style={{ fontSize: '10px', background: 'var(--verdeDim)', color: 'var(--verde)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--verde)' }}>calculado do BP e DRE</span>
        </div>

        <LinhaBloco label="(=) EBITDA do mês" valor={ebitda} barra={barWidth(ebitda, maxVal)} cor="var(--verde)" bold />
        <LinhaBloco label="(-) Variação de Contas a Receber" valor={-varCR} barra={barWidth(varCR, maxVal)} cor="var(--warning)" />
        <LinhaBloco label="(-) Variação de Estoques" valor={-varEstoque} barra={barWidth(varEstoque, maxVal)} cor="var(--warning)" />
        <LinhaBloco label="(+) Variação de Fornecedores" valor={varFornecedores} barra={barWidth(varFornecedores, maxVal)} cor="var(--accent)" />

        <div style={{ background: 'rgba(59,130,246,0.07)', borderTop: '2px solid var(--accent)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>(=) CAIXA OPERACIONAL GERADO</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '16px', color: corValor(caixaOperacional) }}>{fmt(caixaOperacional)}</span>
        </div>
      </div>

      {/* BLOCO MANUAL */}
      <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px' }}>CONSUMO DO CAIXA — LANÇAMENTO MANUAL</span>
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
              <span style={{ flex: 1, color: 'var(--textSub)', fontSize: '13px' }}>
                {l.sinal === -1 ? '(-) ' : '(+/-) '}{l.label}
              </span>
              {isEdit ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input autoFocus value={valorTemp} onChange={e => setValorTemp(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') salvarManual(l.chave); if (e.key === 'Escape') setEditando(null) }}
                    style={{ background: 'var(--card)', border: '1px solid var(--verde)', borderRadius: '4px', color: 'var(--text)', padding: '4px 8px', fontSize: '13px', width: '120px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
                  <button onClick={() => salvarManual(l.chave)} style={{ background: 'var(--verde)', border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                  <button onClick={() => setEditando(null)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--textSub)', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: valorExibir >= 0 ? 'var(--text)' : 'var(--danger)', minWidth: '100px', textAlign: 'right' }}>
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

      {/* RESULTADO FINAL */}
      <div style={{ background: variacaoRealCaixa >= 0 ? 'rgba(0,166,81,0.07)' : 'rgba(240,69,69,0.07)', borderRadius: '8px', border: `2px solid ${variacaoRealCaixa >= 0 ? 'var(--verde)' : 'var(--danger)'}`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>RESULTADO FINAL</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>(=) VARIAÇÃO REAL DE CAIXA</div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '28px', color: variacaoRealCaixa >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
          {fmt(variacaoRealCaixa)}
        </div>
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--textMuted)' }}>
        💡 Valores automáticos calculados a partir do BP e DRE de {meses[competencia.mes - 1]}/{competencia.ano}.
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

function LinhaBloco({ label, valor, barra, cor, bold }) {
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ color: bold ? 'var(--text)' : 'var(--textSub)', fontSize: '13px', fontWeight: bold ? 600 : 400 }}>{label}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: valor >= 0 ? 'var(--text)' : 'var(--danger)', fontWeight: bold ? 700 : 400 }}>{fmt(valor)}</span>
      </div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${barra}%`, background: cor, borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}