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

const estrutura = [
  {
    grupo: 'operacional', label: 'CAIXA OPERACIONAL',
    linhas: [
      { linha: 'recebimentos_clientes', label: '(+) Recebimentos de clientes', sinal: 1 },
      { linha: 'pagamentos_fornecedores', label: '(-) Pagamentos a fornecedores', sinal: -1 },
      { linha: 'pagamentos_despesas', label: '(-) Pagamentos de despesas operacionais', sinal: -1 },
      { linha: 'pagamentos_folha', label: '(-) Pagamentos de folha', sinal: -1 },
      { linha: 'tributos_pagos', label: '(-) Tributos pagos', sinal: -1 },
    ]
  },
  {
    grupo: 'investimentos', label: 'CAIXA DE INVESTIMENTOS',
    linhas: [
      { linha: 'aquisicao_imobilizado', label: '(-) Aquisição de imobilizado', sinal: -1 },
      { linha: 'venda_ativos', label: '(+) Recebimentos de venda de ativos', sinal: 1 },
    ]
  },
  {
    grupo: 'financiamentos', label: 'CAIXA DE FINANCIAMENTOS',
    linhas: [
      { linha: 'emprestimos_captados', label: '(+) Empréstimos captados', sinal: 1 },
      { linha: 'emprestimos_pagos', label: '(-) Amortização de empréstimos', sinal: -1 },
      { linha: 'dividendos', label: '(-) Dividendos distribuídos', sinal: -1 },
    ]
  },
]

export default function DFC({ competencia }) {
  const [lancamentos, setLancamentos] = useState({})
  const [competenciaId, setCompetenciaId] = useState(null)
  const [saldoInicial, setSaldoInicial] = useState(0)
  const [editando, setEditando] = useState(null)
  const [valorTemp, setValorTemp] = useState('')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => { carregarDados() }, [competencia])

  async function carregarDados() {
    setLoading(true)
    setErro(null)
    const { data: comp, error: erroComp } = await supabase
      .from('competencias').select('id')
      .eq('ano', competencia.ano).eq('mes', competencia.mes).maybeSingle()
    if (erroComp) { setErro('Erro de conexão: ' + erroComp.message); setLoading(false); return }
    if (!comp) { setErro(`Competência ${competencia.mes}/${competencia.ano} não cadastrada.`); setLoading(false); return }
    setCompetenciaId(comp.id)
    const { data: lancData } = await supabase.from('dfc_lancamentos').select('*').eq('competencia_id', comp.id)
    const map = {}
    ;(lancData || []).forEach(l => { map[`${l.grupo}_${l.linha}`] = l })
    setLancamentos(map)
    const saldoSalvo = localStorage.getItem(`dfc_saldo_inicial_${comp.id}`)
    if (saldoSalvo) setSaldoInicial(parseFloat(saldoSalvo))
    setLoading(false)
  }

  async function salvarValor(grupo, linha) {
    const valor = parseFloat(valorTemp.replace(',', '.')) || 0
    const chave = `${grupo}_${linha}`
    const existente = lancamentos[chave]
    if (existente) {
      await supabase.from('dfc_lancamentos').update({ valor }).eq('id', existente.id)
    } else {
      await supabase.from('dfc_lancamentos').insert({ competencia_id: competenciaId, grupo, linha, valor })
    }
    setLancamentos(prev => ({ ...prev, [chave]: { ...existente, grupo, linha, valor } }))
    setEditando(null)
  }

  function salvarSaldoInicial() {
    const valor = parseFloat(valorTemp.replace(',', '.')) || 0
    setSaldoInicial(valor)
    localStorage.setItem(`dfc_saldo_inicial_${competenciaId}`, String(valor))
    setEditando(null)
  }

  const getValor = (grupo, linha) => parseFloat(lancamentos[`${grupo}_${linha}`]?.valor || 0)
  const totalGrupo = (g) => g.linhas.reduce((acc, l) => acc + (getValor(g.grupo, l.linha) * l.sinal), 0)

  const totalOperacional = totalGrupo(estrutura[0])
  const totalInvestimentos = totalGrupo(estrutura[1])
  const totalFinanciamentos = totalGrupo(estrutura[2])
  const variacaoCaixa = totalOperacional + totalInvestimentos + totalFinanciamentos
  const saldoFinal = saldoInicial + variacaoCaixa

  const dadosGrafico = [
    { name: 'Operacional', valor: totalOperacional },
    { name: 'Investimentos', valor: totalInvestimentos },
    { name: 'Financiamentos', valor: totalFinanciamentos },
    { name: 'Variação Total', valor: variacaoCaixa },
  ]

  const tooltipStyle = { background: '#101828', border: '1px solid #1C2A40', borderRadius: '6px', color: '#E8EDF5', fontSize: '12px' }

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Carregando Fluxo de Caixa...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          Fluxo de Caixa — {meses[competencia.mes - 1]}/{competencia.ano}
        </h2>
        <button onClick={() => window.print()}
          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
          🖨️ PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* TABELA */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            {estrutura.map(g => (
              <>
                <tr key={g.grupo} style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px', color: 'var(--textSub)', fontWeight: 600, fontSize: '12px' }}>{g.label}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: totalGrupo(g) >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
                    {totalGrupo(g) !== 0 ? fmt(totalGrupo(g)) : '—'}
                  </td>
                </tr>
                {g.linhas.map(l => {
                  const valor = getValor(g.grupo, l.linha)
                  const chave = `${g.grupo}_${l.linha}`
                  const isEdit = editando === chave
                  return (
                    <tr key={chave} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '7px 8px 7px 20px', color: 'var(--textSub)', fontSize: '13px' }}>{l.label}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'right' }}>
                        {isEdit ? (
                          <span>
                            <input autoFocus value={valorTemp} onChange={e => setValorTemp(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') salvarValor(g.grupo, l.linha); if (e.key === 'Escape') setEditando(null) }}
                              style={{ background: 'var(--card)', border: '1px solid var(--verde)', borderRadius: '4px', color: 'var(--text)', padding: '2px 8px', fontSize: '13px', width: '120px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
                            <button onClick={() => salvarValor(g.grupo, l.linha)} style={{ marginLeft: '6px', background: 'var(--verde)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                          </span>
                        ) : (
                          <span onClick={() => { setEditando(chave); setValorTemp(valor ? String(valor) : '') }}
                            title="Clique para editar"
                            style={{ cursor: 'pointer', color: valor ? 'var(--text)' : 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', display: 'inline-block', minWidth: '60px', textAlign: 'right' }}>
                            {valor ? fmt(valor * l.sinal) : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                <tr style={{ background: 'var(--card)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
                  <td style={{ padding: '8px', color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>(=) {g.label}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: totalGrupo(g) >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
                    {fmt(totalGrupo(g))}
                  </td>
                </tr>
              </>
            ))}

            <tr style={{ background: 'rgba(0,166,81,0.07)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
              <td style={{ padding: '10px 8px', color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>VARIAÇÃO DE CAIXA DO MÊS</td>
              <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: variacaoCaixa >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
                {fmt(variacaoCaixa)}
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <td style={{ padding: '7px 8px 7px 20px', color: 'var(--textSub)', fontSize: '13px' }}>(+) Saldo inicial de caixa</td>
              <td style={{ padding: '7px 8px', textAlign: 'right' }}>
                {editando === 'saldo_inicial' ? (
                  <span>
                    <input autoFocus value={valorTemp} onChange={e => setValorTemp(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') salvarSaldoInicial(); if (e.key === 'Escape') setEditando(null) }}
                      style={{ background: 'var(--card)', border: '1px solid var(--verde)', borderRadius: '4px', color: 'var(--text)', padding: '2px 8px', fontSize: '13px', width: '120px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
                    <button onClick={salvarSaldoInicial} style={{ marginLeft: '6px', background: 'var(--verde)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                  </span>
                ) : (
                  <span onClick={() => { setEditando('saldo_inicial'); setValorTemp(saldoInicial ? String(saldoInicial) : '') }}
                    title="Clique para editar"
                    style={{ cursor: 'pointer', color: saldoInicial ? 'var(--text)' : 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', display: 'inline-block', minWidth: '60px', textAlign: 'right' }}>
                    {saldoInicial ? fmt(saldoInicial) : '—'}
                  </span>
                )}
              </td>
            </tr>

            <tr style={{ background: 'rgba(0,166,81,0.07)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
              <td style={{ padding: '10px 8px', color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>(=) SALDO FINAL DE CAIXA</td>
              <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: saldoFinal >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
                {fmt(saldoFinal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* GRÁFICOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Cards resumo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px' }}>
            <CardInfo label="Caixa Operacional" valor={fmt(totalOperacional)} cor={totalOperacional >= 0 ? 'var(--verde)' : 'var(--danger)'} />
            <CardInfo label="Caixa Investimentos" valor={fmt(totalInvestimentos)} cor={totalInvestimentos >= 0 ? 'var(--verde)' : 'var(--danger)'} />
            <CardInfo label="Caixa Financiamentos" valor={fmt(totalFinanciamentos)} cor={totalFinanciamentos >= 0 ? 'var(--verde)' : 'var(--danger)'} />
            <CardInfo label="Saldo Final" valor={fmt(saldoFinal)} cor={saldoFinal >= 0 ? 'var(--verde)' : 'var(--danger)'} destaque />
          </div>

          {/* Gráfico barras */}
          <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px', flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>COMPOSIÇÃO DO FLUXO</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosGrafico} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#6B7FA3', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                <Bar dataKey="valor" radius={[4,4,0,0]}>
                  {dadosGrafico.map((e, i) => (
                    <Cell key={i} fill={e.valor >= 0 ? '#00A651' : '#F04545'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Indicador variação */}
          <div style={{ background: variacaoCaixa >= 0 ? 'rgba(0,166,81,0.07)' : 'rgba(240,69,69,0.07)', borderRadius: '8px', border: `2px solid ${variacaoCaixa >= 0 ? 'var(--verde)' : 'var(--danger)'}`, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>VARIAÇÃO DE CAIXA DO MÊS</div>
              <div style={{ fontSize: '12px', color: 'var(--textSub)' }}>Saldo inicial + Variação = Saldo final</div>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '24px', color: variacaoCaixa >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
              {fmt(variacaoCaixa)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardInfo({ label, valor, cor, destaque }) {
  return (
    <div style={{ background: destaque ? 'rgba(0,166,81,0.07)' : 'var(--card)', border: `1px solid ${destaque ? 'rgba(0,166,81,0.3)' : 'var(--border)'}`, borderRadius: '8px', padding: '14px', borderTop: `3px solid ${cor}` }}>
      <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: 600, marginBottom: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '18px', color: cor }}>{valor}</div>
    </div>
  )
}