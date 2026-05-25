import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  const str = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return v < 0 ? `(R$ ${str})` : `R$ ${str}`
}

const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const estrutura = [
  {
    grupo: 'operacional',
    label: 'CAIXA OPERACIONAL',
    linhas: [
      { linha: 'recebimentos_clientes', label: '(+) Recebimentos de clientes', sinal: 1 },
      { linha: 'pagamentos_fornecedores', label: '(-) Pagamentos a fornecedores', sinal: -1 },
      { linha: 'pagamentos_despesas', label: '(-) Pagamentos de despesas operacionais', sinal: -1 },
      { linha: 'pagamentos_folha', label: '(-) Pagamentos de folha', sinal: -1 },
      { linha: 'tributos_pagos', label: '(-) Tributos pagos', sinal: -1 },
    ]
  },
  {
    grupo: 'investimentos',
    label: 'CAIXA DE INVESTIMENTOS',
    linhas: [
      { linha: 'aquisicao_imobilizado', label: '(-) Aquisição de imobilizado', sinal: -1 },
      { linha: 'venda_ativos', label: '(+) Recebimentos de venda de ativos', sinal: 1 },
    ]
  },
  {
    grupo: 'financiamentos',
    label: 'CAIXA DE FINANCIAMENTOS',
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

    const { data: lancData } = await supabase
      .from('dfc_lancamentos').select('*').eq('competencia_id', comp.id)

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
      await supabase.from('dfc_lancamentos').insert({
        competencia_id: competenciaId, grupo, linha, valor
      })
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

  const getValor = (grupo, linha) => {
    const chave = `${grupo}_${linha}`
    return parseFloat(lancamentos[chave]?.valor || 0)
  }

  const totalGrupo = (g) => g.linhas.reduce((acc, l) => acc + (getValor(g.grupo, l.linha) * l.sinal), 0)

  const totalOperacional = totalGrupo(estrutura[0])
  const totalInvestimentos = totalGrupo(estrutura[1])
  const totalFinanciamentos = totalGrupo(estrutura[2])
  const variacaoCaixa = totalOperacional + totalInvestimentos + totalFinanciamentos
  const saldoFinal = saldoInicial + variacaoCaixa

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Carregando Fluxo de Caixa...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          Fluxo de Caixa — {meses[competencia.mes - 1]}/{competencia.ano}
        </h2>
        <button onClick={() => window.print()}
          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
          🖨️ PDF
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <tbody>

          {estrutura.map(g => (
            <>
              <tr style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
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

          {/* VARIAÇÃO DE CAIXA */}
          <tr style={{ background: 'rgba(0,166,81,0.07)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
            <td style={{ padding: '10px 8px', color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>VARIAÇÃO DE CAIXA DO MÊS</td>
            <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: variacaoCaixa >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
              {fmt(variacaoCaixa)}
            </td>
          </tr>

          {/* SALDO INICIAL */}
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

          {/* SALDO FINAL */}
          <tr style={{ background: 'rgba(0,166,81,0.07)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
            <td style={{ padding: '10px 8px', color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>(=) SALDO FINAL DE CAIXA</td>
            <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: saldoFinal >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
              {fmt(saldoFinal)}
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  )
}