import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  const str = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return v < 0 ? `(R$ ${str})` : `R$ ${str}`
}
const fmtPct = (v) => (!v || isNaN(v) || !isFinite(v)) ? '—' : v.toFixed(1) + '%'
const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const departamentos = [
  { id: 'adm', label: 'Administrativo', grupo: 'DESPESAS ADMINISTRATIVAS', cor: '#3B82F6' },
  { id: 'vendas', label: 'Vendas', grupo: 'DESPESAS COM VENDAS', cor: '#00A651' },
  { id: 'marketing', label: 'Marketing', grupo: 'MARKETING', cor: '#8B5CF6' },
  { id: 'estrutural', label: 'Estrutural', grupo: 'DESPESAS ESTRUTURAIS', cor: '#E8920A' },
  { id: 'entrega', label: 'Entrega/Logística', grupo: 'ENTREGA / LOGÍSTICA', cor: '#06B6D4' },
  { id: 'seguranca', label: 'Segurança Trabalho', grupo: 'SEGURANÇA DO TRABALHO', cor: '#F59E0B' },
  { id: 'terceiros', label: 'Terceiros', grupo: 'SERVIÇOS DE TERCEIROS', cor: '#EC4899' },
  { id: 'treinamentos', label: 'Treinamentos', grupo: 'TREINAMENTOS', cor: '#10B981' },
]

export default function AnaliseDespesas({ competencia }) {
  const [dados, setDados] = useState(null)
  const [aba, setAba] = useState('departamentos')
  const [orcamentos, setOrcamentos] = useState({})
  const [editandoOrc, setEditandoOrc] = useState(null)
  const [orcTemp, setOrcTemp] = useState('')
  const [compId, setCompId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

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

    const receitaLiquida = (() => {
      const rb = (dreContas||[]).filter(c=>c.tipo==='receita').reduce((a,c)=>a+(dreMap[c.id]||0),0)
      const ded = (dreContas||[]).filter(c=>c.tipo==='deducao').reduce((a,c)=>a+(dreMap[c.id]||0),0)
      return rb - ded
    })()

    const totalGrupo = (grupo) => (dreContas||[]).filter(c=>c.grupo===grupo).reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const totalFixas = (dreContas||[]).filter(c=>c.natureza==='fixa' && c.tipo==='despesa').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const totalVariaveis = (dreContas||[]).filter(c=>c.natureza==='variavel' && c.tipo==='despesa').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const totalDespesas = totalFixas + totalVariaveis

    const orcSalvos = localStorage.getItem(`orcamentos_${comp.id}`)
    const orcObj = orcSalvos ? JSON.parse(orcSalvos) : {}

    setOrcamentos(orcObj)
    setDados({ dreContas, dreMap, receitaLiquida, totalGrupo, totalFixas, totalVariaveis, totalDespesas })
    setLoading(false)
  }

  function salvarOrcamento(depto) {
    const valor = parseFloat(orcTemp.replace(',', '.')) || 0
    const novosOrc = { ...orcamentos, [depto]: valor }
    setOrcamentos(novosOrc)
    localStorage.setItem(`orcamentos_${compId}`, JSON.stringify(novosOrc))
    setEditandoOrc(null)
  }

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Carregando Análise de Despesas...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  const { dreContas, dreMap, receitaLiquida, totalGrupo, totalFixas, totalVariaveis, totalDespesas } = dados
  const tooltipStyle = { background: '#101828', border: '1px solid #1C2A40', borderRadius: '6px', color: '#E8EDF5', fontSize: '12px' }

  const dadosDeptoPie = departamentos.map(d => ({
    name: d.label, valor: totalGrupo(d.grupo), cor: d.cor
  })).filter(d => d.valor > 0)

  const dadosFixVar = [
    { name: 'Fixas', valor: totalFixas, cor: '#3B82F6' },
    { name: 'Variáveis', valor: totalVariaveis, cor: '#E8920A' },
  ]

  const margemContribuicao = receitaLiquida > 0 ? ((receitaLiquida - totalVariaveis) / receitaLiquida) * 100 : 0
  const pontoEquilibrio = margemContribuicao > 0 ? (totalFixas / (margemContribuicao / 100)) : 0

  return (
    <div style={{ width: '100%' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Análise de Despesas</h2>
          <div style={{ fontSize: '13px', color: 'var(--textSub)' }}>{meses[competencia.mes - 1]}/{competencia.ano}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setAba('departamentos')}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: aba === 'departamentos' ? 'var(--verde)' : 'var(--card)', color: aba === 'departamentos' ? '#fff' : 'var(--textSub)' }}>
            Por Departamento
          </button>
          <button onClick={() => setAba('fixvar')}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: aba === 'fixvar' ? 'var(--verde)' : 'var(--card)', color: aba === 'fixvar' ? '#fff' : 'var(--textSub)' }}>
            Fixas × Variáveis
          </button>
          <button onClick={() => window.print()}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
            🖨️ PDF
          </button>
        </div>
      </div>

      {aba === 'departamentos' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '11px', marginBottom: '20px' }}>
            <CardResumo label="Total Despesas" valor={fmt(totalDespesas)} cor="var(--danger)" sub={fmtPct(receitaLiquida > 0 ? totalDespesas/receitaLiquida*100 : 0) + ' da RL'} />
            <CardResumo label="Maior Depto" valor={departamentos.reduce((max, d) => totalGrupo(d.grupo) > totalGrupo(max.grupo) ? d : max, departamentos[0]).label} cor="var(--warning)" sub="Maior consumo" />
            <CardResumo label="Receita Líquida" valor={fmt(receitaLiquida)} cor="var(--verde)" sub="Base de cálculo" />
            <CardResumo label="Orçamentos" valor={Object.keys(orcamentos).filter(k => orcamentos[k] > 0).length + '/' + departamentos.length} cor="var(--accent)" sub="Deptos com meta" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* TABELA */}
            <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '10px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px' }}>
                <span>DEPARTAMENTO</span>
                <span style={{ textAlign: 'right' }}>VALOR</span>
                <span style={{ textAlign: 'right' }}>% RL</span>
                <span style={{ textAlign: 'right' }}>ORÇAMENTO</span>
              </div>
              {departamentos.map(d => {
                const valor = totalGrupo(d.grupo)
                const pctRL = receitaLiquida > 0 ? (valor / receitaLiquida) * 100 : 0
                const orc = orcamentos[d.id] || 0
                const delta = orc > 0 ? valor - orc : null
                const isEdit = editandoOrc === d.id
                return (
                  <div key={d.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', padding: '10px 16px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '3px', height: '20px', background: d.cor, borderRadius: '2px' }} />
                        <span style={{ color: 'var(--textSub)', fontSize: '13px' }}>{d.label}</span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: valor > 0 ? 'var(--text)' : 'var(--textMuted)', textAlign: 'right' }}>
                        {valor > 0 ? fmt(valor) : '—'}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--textMuted)', textAlign: 'right' }}>
                        {fmtPct(pctRL)}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        {isEdit ? (
                          <span style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <input autoFocus value={orcTemp} onChange={e => setOrcTemp(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') salvarOrcamento(d.id); if (e.key === 'Escape') setEditandoOrc(null) }}
                              style={{ background: 'var(--card)', border: '1px solid var(--accent)', borderRadius: '4px', color: 'var(--text)', padding: '2px 6px', fontSize: '12px', width: '90px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
                            <button onClick={() => salvarOrcamento(d.id)} style={{ background: 'var(--accent)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 6px', cursor: 'pointer', fontSize: '11px' }}>✓</button>
                          </span>
                        ) : (
                          <span onClick={() => { setEditandoOrc(d.id); setOrcTemp(orc ? String(orc) : '') }}
                            style={{ cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: orc ? (delta !== null && delta > 0 ? 'var(--danger)' : 'var(--verde)') : 'var(--textMuted)' }}>
                            {orc ? fmt(orc) : '+ meta'}
                          </span>
                        )}
                      </div>
                    </div>
                    {delta !== null && (
                      <div style={{ padding: '0 16px 8px 16px' }}>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min((valor/orc)*100, 100)}%`, background: delta > 0 ? 'var(--danger)' : 'var(--verde)', borderRadius: '2px' }} />
                        </div>
                        <div style={{ fontSize: '10px', color: delta > 0 ? 'var(--danger)' : 'var(--verde)', marginTop: '2px' }}>
                          {delta > 0 ? '▲ Acima ' : '▼ Abaixo '} do orçamento: {fmt(Math.abs(delta))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* GRÁFICOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>DISTRIBUIÇÃO POR DEPARTAMENTO</div>
                {dadosDeptoPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={dadosDeptoPie} dataKey="valor" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                        {dadosDeptoPie.map((e, i) => <Cell key={i} fill={e.cor} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#6B7FA3' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--textMuted)', fontSize: '13px' }}>
                    Lance despesas na DRE para visualizar
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>VALOR POR DEPARTAMENTO</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={departamentos.map(d => ({ name: d.label.split('/')[0].trim(), valor: totalGrupo(d.grupo), cor: d.cor }))} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                    <XAxis dataKey="name" tick={{ fill: '#6B7FA3', fontSize: 10 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                    <Bar dataKey="valor" radius={[4,4,0,0]}>
                      {departamentos.map((d, i) => <Cell key={i} fill={d.cor} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {aba === 'fixvar' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '11px', marginBottom: '20px' }}>
            <CardResumo label="Total Fixas" valor={fmt(totalFixas)} cor="#3B82F6" sub={fmtPct(receitaLiquida > 0 ? totalFixas/receitaLiquida*100 : 0) + ' da RL'} />
            <CardResumo label="Total Variáveis" valor={fmt(totalVariaveis)} cor="#E8920A" sub={fmtPct(receitaLiquida > 0 ? totalVariaveis/receitaLiquida*100 : 0) + ' da RL'} />
            <CardResumo label="Margem Contribuição" valor={fmtPct(margemContribuicao)} cor="var(--verde)" sub="(RL − Variáveis) / RL" />
            <CardResumo label="Ponto de Equilíbrio" valor={fmt(pontoEquilibrio)} cor="var(--warning)" sub="Fixas ÷ MC%" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            {/* TABELA FIXAS x VARIÁVEIS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['fixa', 'variavel'].map(natureza => (
                <div key={natureza} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: natureza === 'fixa' ? '#3B82F6' : '#E8920A', letterSpacing: '1px' }}>
                      {natureza === 'fixa' ? '🔒 DESPESAS FIXAS' : '📈 DESPESAS VARIÁVEIS'}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: natureza === 'fixa' ? '#3B82F6' : '#E8920A' }}>
                      {fmt(natureza === 'fixa' ? totalFixas : totalVariaveis)}
                    </span>
                  </div>
                  {(dreContas||[]).filter(c => c.natureza === natureza && c.tipo === 'despesa').map(c => {
                    const valor = dreMap[c.id] || 0
                    if (valor === 0) return null
                    return (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ color: 'var(--textSub)' }}>{c.nome}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)' }}>{fmt(valor)}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* GRÁFICOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>FIXAS × VARIÁVEIS</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={dadosFixVar} dataKey="valor" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                      {dadosFixVar.map((e, i) => <Cell key={i} fill={e.cor} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#6B7FA3' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>PONTO DE EQUILÍBRIO</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--textSub)' }}>Receita Líquida atual</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--verde)' }}>{fmt(receitaLiquida)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--textSub)' }}>Ponto de Equilíbrio</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--warning)' }}>{fmt(pontoEquilibrio)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--textSub)' }}>Margem de Contribuição</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--verde)' }}>{fmtPct(margemContribuicao)}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(pontoEquilibrio > 0 ? (receitaLiquida/pontoEquilibrio)*100 : 0, 100)}%`, background: receitaLiquida >= pontoEquilibrio ? 'var(--verde)' : 'var(--danger)', borderRadius: '4px' }} />
                </div>
                <div style={{ fontSize: '11px', color: receitaLiquida >= pontoEquilibrio ? 'var(--verde)' : 'var(--danger)', marginTop: '8px' }}>
                  {receitaLiquida >= pontoEquilibrio ? '✔ Acima do ponto de equilíbrio' : '✘ Abaixo do ponto de equilíbrio'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CardResumo({ label, valor, cor, sub }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', borderTop: `3px solid ${cor}` }}>
      <div style={{ fontSize: '10px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '0.3px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '18px', color: cor, marginBottom: '4px' }}>{valor}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--textMuted)' }}>{sub}</div>}
    </div>
  )
}