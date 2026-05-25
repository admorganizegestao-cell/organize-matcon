import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  const str = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return v < 0 ? `(R$ ${str})` : `R$ ${str}`
}

const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const gruposAtivo = ['ATIVO CIRCULANTE', 'ATIVO NÃO CIRCULANTE']
const gruposPassivo = ['PASSIVO CIRCULANTE', 'PASSIVO NÃO CIRCULANTE', 'PATRIMÔNIO LÍQUIDO']

export default function BP({ competencia }) {
  const [contas, setContas] = useState([])
  const [lancamentos, setLancamentos] = useState({})
  const [competenciaId, setCompetenciaId] = useState(null)
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

    const { data: contasData } = await supabase
      .from('bp_contas').select('*').eq('ativo', true).order('ordem')

    const { data: lancData } = await supabase
      .from('bp_lancamentos').select('*').eq('competencia_id', comp.id)

    setContas(contasData || [])
    const map = {}
    ;(lancData || []).forEach(l => { map[l.conta_id] = l })
    setLancamentos(map)
    setLoading(false)
  }

  async function salvarValor(conta) {
    const valor = parseFloat(valorTemp.replace(',', '.')) || 0
    const existente = lancamentos[conta.id]
    if (existente) {
      await supabase.from('bp_lancamentos').update({ valor }).eq('id', existente.id)
    } else {
      await supabase.from('bp_lancamentos').insert({
        competencia_id: competenciaId, conta_id: conta.id, valor
      })
    }
    setLancamentos(prev => ({ ...prev, [conta.id]: { ...existente, conta_id: conta.id, valor } }))
    setEditando(null)
  }

  const getValor = (conta) => {
    if (!conta || !conta.id) return 0
    return parseFloat(lancamentos[conta.id]?.valor || 0)
  }

  const somaGrupo = (grupo) => contas.filter(c => c.grupo === grupo).reduce((acc, c) => acc + getValor(c), 0)
  const somaTipo = (tipo) => contas.filter(c => c.tipo === tipo).reduce((acc, c) => acc + getValor(c), 0)

  const totalAtivo = somaTipo('ativo')
  const totalPassivo = somaTipo('passivo') + somaTipo('pl')
  const balanceado = Math.abs(totalAtivo - totalPassivo) < 0.01

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Carregando Balanço Patrimonial...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          Balanço Patrimonial — {meses[competencia.mes - 1]}/{competencia.ano}
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
            background: balanceado ? 'rgba(0,166,81,0.1)' : 'rgba(240,69,69,0.1)',
            color: balanceado ? 'var(--verde)' : 'var(--danger)',
            border: `1px solid ${balanceado ? 'var(--verde)' : 'var(--danger)'}`,
          }}>
            {balanceado ? '✔ BALANCEADO' : '✘ VERIFICAR'}
          </span>
          <button onClick={() => window.print()}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
            🖨️ PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ATIVO */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '8px', padding: '0 8px' }}>
            ATIVO — {fmt(totalAtivo)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {gruposAtivo.map(grupo => (
                <GrupoContas key={grupo} grupo={grupo} contas={contas} getValor={getValor} somaGrupo={somaGrupo}
                  editando={editando} valorTemp={valorTemp} setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
              ))}
              <LinhaTotal label="TOTAL ATIVO" valor={totalAtivo} />
            </tbody>
          </table>
        </div>

        {/* PASSIVO + PL */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '8px', padding: '0 8px' }}>
            PASSIVO + PL — {fmt(totalPassivo)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {gruposPassivo.map(grupo => (
                <GrupoContas key={grupo} grupo={grupo} contas={contas} getValor={getValor} somaGrupo={somaGrupo}
                  editando={editando} valorTemp={valorTemp} setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
              ))}
              <LinhaTotal label="TOTAL PASSIVO + PL" valor={totalPassivo} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GrupoContas({ grupo, contas, getValor, somaGrupo, editando, valorTemp, setEditando, setValorTemp, salvarValor }) {
  const contasGrupo = contas.filter(c => c.grupo === grupo)
  const total = somaGrupo(grupo)
  return (
    <>
      <tr style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <td style={{ padding: '8px', color: 'var(--textSub)', fontWeight: 600, fontSize: '12px' }}>{grupo}</td>
        <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: total >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
          {total !== 0 ? fmt(total) : '—'}
        </td>
      </tr>
      {contasGrupo.map(c => (
        <LinhaConta key={c.id} conta={c} valor={getValor(c)} editando={editando} valorTemp={valorTemp}
          setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
      ))}
    </>
  )
}

function LinhaTotal({ label, valor }) {
  return (
    <tr style={{ background: 'rgba(0,166,81,0.07)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
      <td style={{ padding: '10px 8px', color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>{label}</td>
      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: valor >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
        {fmt(valor)}
      </td>
    </tr>
  )
}

function LinhaConta({ conta, valor, editando, valorTemp, setEditando, setValorTemp, salvarValor }) {
  const isEdit = editando === conta.id
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <td style={{ padding: '7px 8px 7px 16px', color: 'var(--textSub)', fontSize: '12px' }}>
        <span style={{ color: 'var(--textMuted)', marginRight: '6px', fontSize: '11px' }}>{conta.codigo}</span>
        {conta.nome}
      </td>
      <td style={{ padding: '7px 8px', textAlign: 'right' }}>
        {isEdit ? (
          <span>
            <input autoFocus value={valorTemp} onChange={e => setValorTemp(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') salvarValor(conta); if (e.key === 'Escape') setEditando(null) }}
              style={{ background: 'var(--card)', border: '1px solid var(--verde)', borderRadius: '4px', color: 'var(--text)', padding: '2px 6px', fontSize: '12px', width: '100px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
            <button onClick={() => salvarValor(conta)} style={{ marginLeft: '4px', background: 'var(--verde)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 6px', cursor: 'pointer', fontSize: '11px' }}>✓</button>
          </span>
        ) : (
          <span
            onClick={() => { setEditando(conta.id); setValorTemp(valor ? String(valor) : '') }}
            title="Clique para editar"
            style={{ cursor: 'pointer', color: valor ? 'var(--text)' : 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', display: 'inline-block', minWidth: '60px', textAlign: 'right' }}>
            {valor ? fmt(valor) : '—'}
          </span>
        )}
      </td>
    </tr>
  )
}