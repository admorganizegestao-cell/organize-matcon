import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  const str = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return v < 0 ? `(R$ ${str})` : `R$ ${str}`
}

const pct = (v, base) => {
  if (!base || base === 0) return '—'
  return ((v / base) * 100).toFixed(1) + '%'
}

const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const gruposDespesa = [
  'DESPESAS ADMINISTRATIVAS','DESPESAS COM VENDAS','MARKETING',
  'DESPESAS ESTRUTURAIS','ENTREGA / LOGÍSTICA','SEGURANÇA DO TRABALHO',
  'SERVIÇOS DE TERCEIROS','TREINAMENTOS'
]

export default function DRE({ competencia }) {
  const [contas, setContas] = useState([])
  const [lancamentos, setLancamentos] = useState({})
  const [extras, setExtras] = useState([])
  const [metas, setMetas] = useState({})
  const [competenciaId, setCompetenciaId] = useState(null)
  const [editando, setEditando] = useState(null)
  const [valorTemp, setValorTemp] = useState('')
  const [editandoMeta, setEditandoMeta] = useState(null)
  const [metaTemp, setMetaTemp] = useState('')
  const [novoExtra, setNovoExtra] = useState({ tipo: '', descricao: '', valor: '' })
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [visao, setVisao] = useState('sintetica')

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

    const { data: contasData } = await supabase.from('dre_contas').select('*').eq('ativo', true).order('ordem')
    const { data: lancData } = await supabase.from('dre_lancamentos').select('*').eq('competencia_id', comp.id)
    const { data: extraData } = await supabase.from('movimentos_extracontabeis').select('*').eq('competencia_id', comp.id)

    setContas(contasData || [])
    const map = {}
    ;(lancData || []).forEach(l => { map[l.conta_id] = l })
    setLancamentos(map)
    setExtras(extraData || [])

    const metasSalvas = localStorage.getItem(`metas_dre_${comp.id}`)
    if (metasSalvas) setMetas(JSON.parse(metasSalvas))

    setLoading(false)
  }

  async function salvarValor(conta) {
    const valor = parseFloat(valorTemp.replace(',', '.')) || 0
    const existente = lancamentos[conta.id]
    if (existente) {
      await supabase.from('dre_lancamentos').update({ valor }).eq('id', existente.id)
    } else {
      await supabase.from('dre_lancamentos').insert({ competencia_id: competenciaId, conta_id: conta.id, valor })
    }
    setLancamentos(prev => ({ ...prev, [conta.id]: { ...existente, conta_id: conta.id, valor } }))
    setEditando(null)
  }

  function salvarMeta(chave) {
    const valor = parseFloat(metaTemp.replace(',', '.')) || 0
    const novasMetas = { ...metas, [chave]: valor }
    setMetas(novasMetas)
    localStorage.setItem(`metas_dre_${competenciaId}`, JSON.stringify(novasMetas))
    setEditandoMeta(null)
  }

  async function salvarExtra() {
    if (!novoExtra.tipo || !novoExtra.valor) return
    const valor = parseFloat(novoExtra.valor.replace(',', '.')) || 0
    await supabase.from('movimentos_extracontabeis').insert({
      competencia_id: competenciaId, tipo: novoExtra.tipo, descricao: novoExtra.descricao, valor,
    })
    setNovoExtra({ tipo: '', descricao: '', valor: '' })
    carregarDados()
  }

  async function deletarExtra(id) {
    await supabase.from('movimentos_extracontabeis').delete().eq('id', id)
    setExtras(prev => prev.filter(e => e.id !== id))
  }

  const getValor = (conta) => {
    if (!conta || !conta.id) return 0
    return parseFloat(lancamentos[conta.id]?.valor || 0)
  }

  const somaGrupo = (grupo) => contas.filter(c => c.grupo === grupo).reduce((acc, c) => acc + getValor(c), 0)
  const somaTipo = (tipo) => contas.filter(c => c.tipo === tipo).reduce((acc, c) => acc + getValor(c), 0)

  const receitaBruta = somaTipo('receita')
  const deducoes = somaTipo('deducao')
  const receitaLiquida = receitaBruta - deducoes
  const cv = (cod) => contas.find(c => c.codigo === cod)
  const cmv = getValor(cv('3.01')) + getValor(cv('3.02')) + getValor(cv('3.03')) - getValor(cv('3.04')) - getValor(cv('3.05'))
  const lucroBruto = receitaLiquida - cmv
  const totalDespesas = gruposDespesa.reduce((acc, g) => acc + somaGrupo(g), 0)
  const ebitda = lucroBruto - totalDespesas
  const financeiro = somaTipo('financeiro')
  const complementar = somaTipo('complementar')
  const lucroLiquido = ebitda - financeiro + complementar
  const totalExtras = extras.reduce((acc, e) => acc + parseFloat(e.valor || 0), 0)
  const resultadoDisponivel = lucroLiquido - totalExtras
  const base = receitaLiquida

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Carregando DRE...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  return (
    <div style={{ width: '100%' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          DRE Gerencial — {meses[competencia.mes - 1]}/{competencia.ano}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVisao('sintetica')}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: visao === 'sintetica' ? 'var(--verde)' : 'var(--card)', color: visao === 'sintetica' ? '#fff' : 'var(--textSub)' }}>
            Síntese
          </button>
          <button onClick={() => setVisao('analitica')}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: visao === 'analitica' ? 'var(--verde)' : 'var(--card)', color: visao === 'analitica' ? '#fff' : 'var(--textSub)' }}>
            Analítica
          </button>
          <button onClick={() => window.print()}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
            🖨️ PDF
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', color: 'var(--textMuted)', padding: '6px 8px', fontWeight: 500, fontSize: '12px' }}>CONTA</th>
            <th style={{ textAlign: 'right', color: 'var(--textMuted)', padding: '6px 8px', fontWeight: 500, fontSize: '12px' }}>VALOR</th>
            <th style={{ textAlign: 'right', color: 'var(--textMuted)', padding: '6px 8px', fontWeight: 500, fontSize: '12px' }}>% RL</th>
            <th style={{ textAlign: 'right', color: 'var(--textMuted)', padding: '6px 8px', fontWeight: 500, fontSize: '12px' }}>META</th>
            <th style={{ textAlign: 'right', color: 'var(--textMuted)', padding: '6px 8px', fontWeight: 500, fontSize: '12px' }}>Δ META</th>
          </tr>
        </thead>
        <tbody>

          {/* RECEITA BRUTA */}
          <LinhaGrupo label="RECEITA BRUTA" valor={receitaBruta} base={base} chave="receitaBruta"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
          {visao === 'analitica' && contas.filter(c => c.grupo === 'RECEITA BRUTA').map(c => (
            <LinhaConta key={c.id} conta={c} valor={getValor(c)} base={base}
              editando={editando} valorTemp={valorTemp}
              setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
          ))}

          {/* DEDUÇÕES */}
          <LinhaGrupo label="(-) DEDUÇÕES" valor={-deducoes} base={base} chave="deducoes"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
          {visao === 'analitica' && contas.filter(c => c.grupo === 'DEDUÇÕES').map(c => (
            <LinhaConta key={c.id} conta={c} valor={getValor(c)} base={base}
              editando={editando} valorTemp={valorTemp}
              setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
          ))}

          <LinhaTotal label="(=) RECEITA LÍQUIDA" valor={receitaLiquida} base={base} chave="receitaLiquida"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />

          {/* CMV */}
          <LinhaGrupo label="(-) CMV" valor={-cmv} base={base} chave="cmv"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
          {visao === 'analitica' && contas.filter(c => c.grupo === 'CMV').map(c => (
            <LinhaConta key={c.id} conta={c} valor={getValor(c)} base={base}
              editando={editando} valorTemp={valorTemp}
              setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
          ))}

          <LinhaTotal label="(=) LUCRO BRUTO" valor={lucroBruto} base={base} chave="lucroBruto"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />

          {/* DESPESAS */}
          {gruposDespesa.map(grupo => (
            <GrupoDespesa key={grupo} grupo={grupo} contas={contas} getValor={getValor}
              somaGrupo={somaGrupo} base={base} visao={visao}
              editando={editando} valorTemp={valorTemp}
              setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor}
              metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
              setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
          ))}

          <LinhaTotal label="(=) EBITDA" valor={ebitda} base={base} chave="ebitda"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />

          {/* FINANCEIRO */}
          <LinhaGrupo label="(-) DESPESAS FINANCEIRAS" valor={-financeiro} base={base} chave="financeiro"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
          {visao === 'analitica' && contas.filter(c => c.tipo === 'financeiro').map(c => (
            <LinhaConta key={c.id} conta={c} valor={getValor(c)} base={base}
              editando={editando} valorTemp={valorTemp}
              setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
          ))}

          {/* COMPLEMENTAR */}
          <LinhaGrupo label="(+) RECEITAS COMPLEMENTARES" valor={complementar} base={base} chave="complementar"
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
          {visao === 'analitica' && contas.filter(c => c.tipo === 'complementar').map(c => (
            <LinhaConta key={c.id} conta={c} valor={getValor(c)} base={base}
              editando={editando} valorTemp={valorTemp}
              setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
          ))}

          <LinhaTotal label="(=) LUCRO LÍQUIDO" valor={lucroLiquido} base={base} chave="lucroLiquido" destaque
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />

          {/* MOVIMENTOS FORA DA DRE */}
          <tr>
            <td colSpan={5} style={{ padding: '16px 8px 6px', color: 'var(--warning)', fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px' }}>
              MOVIMENTOS FORA DA DRE — OBRIGAÇÕES DO PASSADO
            </td>
          </tr>

          {extras.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '7px 8px 7px 20px', color: 'var(--textSub)' }}>
                {e.tipo} {e.descricao && <span style={{ color: 'var(--textMuted)', fontSize: '11px' }}>{e.descricao}</span>}
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--danger)', fontFamily: 'JetBrains Mono, monospace' }}>
                ({fmt(parseFloat(e.valor))})
                <button onClick={() => deletarExtra(e.id)} style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'var(--textMuted)', cursor: 'pointer', fontSize: '11px' }}>✕</button>
              </td>
              <td style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                {pct(-parseFloat(e.valor), base)}
              </td>
              <td colSpan={2}></td>
            </tr>
          ))}

          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '6px 8px 6px 20px' }} colSpan={2}>
              <input placeholder="Tipo (ex: Parcelamento de Impostos)" value={novoExtra.tipo}
                onChange={e => setNovoExtra(p => ({ ...p, tipo: e.target.value }))}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', padding: '4px 8px', fontSize: '12px', width: '220px', marginRight: '8px' }} />
              <input placeholder="Descrição (opcional)" value={novoExtra.descricao}
                onChange={e => setNovoExtra(p => ({ ...p, descricao: e.target.value }))}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', padding: '4px 8px', fontSize: '12px', width: '140px' }} />
            </td>
            <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right' }}>
              <input placeholder="Valor" value={novoExtra.valor}
                onChange={e => setNovoExtra(p => ({ ...p, valor: e.target.value }))}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', padding: '4px 8px', fontSize: '12px', width: '100px', marginRight: '8px', textAlign: 'right' }} />
              <button onClick={salvarExtra}
                style={{ background: 'var(--verde)', border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>
                + Adicionar
              </button>
            </td>
          </tr>

          <LinhaTotal label="(=) RESULTADO DISPONÍVEL" valor={resultadoDisponivel} base={base} chave="resultadoDisponivel" destaque
            metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
            setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />

        </tbody>
      </table>
    </div>
  )
}

function GrupoDespesa({ grupo, contas, getValor, somaGrupo, base, visao, editando, valorTemp, setEditando, setValorTemp, salvarValor, metas, editandoMeta, metaTemp, setEditandoMeta, setMetaTemp, salvarMeta }) {
  const chave = grupo.replace(/\s/g, '_').toLowerCase()
  return (
    <>
      <LinhaGrupo label={`(-) ${grupo}`} valor={-somaGrupo(grupo)} base={base} chave={chave}
        metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
        setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
      {visao === 'analitica' && contas.filter(c => c.grupo === grupo).map(c => (
        <LinhaConta key={c.id} conta={c} valor={getValor(c)} base={base}
          editando={editando} valorTemp={valorTemp}
          setEditando={setEditando} setValorTemp={setValorTemp} salvarValor={salvarValor} />
      ))}
    </>
  )
}

function CelulaMeta({ chave, metas, editandoMeta, metaTemp, setEditandoMeta, setMetaTemp, salvarMeta, valor }) {
  const meta = metas[chave] || 0
  const delta = meta ? valor - meta : null
  return (
    <>
      <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
        {editandoMeta === chave ? (
          <span>
            <input autoFocus value={metaTemp} onChange={e => setMetaTemp(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') salvarMeta(chave); if (e.key === 'Escape') setEditandoMeta(null) }}
              style={{ background: 'var(--card)', border: '1px solid var(--accent)', borderRadius: '4px', color: 'var(--text)', padding: '2px 6px', fontSize: '12px', width: '90px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
            <button onClick={() => salvarMeta(chave)} style={{ marginLeft: '4px', background: 'var(--accent)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 6px', cursor: 'pointer', fontSize: '11px' }}>✓</button>
          </span>
        ) : (
          <span onClick={() => { setEditandoMeta(chave); setMetaTemp(meta ? String(meta) : '') }}
            style={{ cursor: 'pointer', color: meta ? 'var(--accent)' : 'var(--textMuted)' }}>
            {meta ? fmt(meta) : '—'}
          </span>
        )}
      </td>
      <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
        color: delta === null ? 'var(--textMuted)' : delta >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
        {delta !== null ? (delta >= 0 ? '▲ ' : '▼ ') + fmt(Math.abs(delta)) : '—'}
      </td>
    </>
  )
}

function LinhaGrupo({ label, valor, base, chave, metas, editandoMeta, metaTemp, setEditandoMeta, setMetaTemp, salvarMeta }) {
  return (
    <tr style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <td style={{ padding: '8px', color: 'var(--textSub)', fontWeight: 600, fontSize: '12px' }}>{label}</td>
      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: valor >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
        {valor !== 0 ? fmt(valor) : '—'}
      </td>
      <td style={{ padding: '8px', textAlign: 'right', color: 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
        {base && base !== 0 ? ((valor / base) * 100).toFixed(1) + '%' : '—'}
      </td>
      <CelulaMeta chave={chave} valor={valor} metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
        setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
    </tr>
  )
}

function LinhaTotal({ label, valor, base, chave, destaque, metas, editandoMeta, metaTemp, setEditandoMeta, setMetaTemp, salvarMeta }) {
  return (
    <tr style={{ background: destaque ? 'rgba(0,166,81,0.07)' : 'var(--card)', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
      <td style={{ padding: '10px 8px', color: 'var(--text)', fontWeight: 700, fontSize: '13px' }}>{label}</td>
      <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: valor >= 0 ? 'var(--verde)' : 'var(--danger)' }}>
        {fmt(valor)}
      </td>
      <td style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
        {base && base !== 0 ? ((valor / base) * 100).toFixed(1) + '%' : '—'}
      </td>
      <CelulaMeta chave={chave} valor={valor} metas={metas} editandoMeta={editandoMeta} metaTemp={metaTemp}
        setEditandoMeta={setEditandoMeta} setMetaTemp={setMetaTemp} salvarMeta={salvarMeta} />
    </tr>
  )
}

function LinhaConta({ conta, valor, base, editando, valorTemp, setEditando, setValorTemp, salvarValor }) {
  const isEdit = editando === conta.id
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <td style={{ padding: '7px 8px 7px 20px', color: 'var(--textSub)', fontSize: '13px' }}>
        <span style={{ color: 'var(--textMuted)', marginRight: '8px', fontSize: '11px' }}>{conta.codigo}</span>
        {conta.nome}
      </td>
      <td style={{ padding: '7px 8px', textAlign: 'right' }}>
        {isEdit ? (
          <span>
            <input autoFocus value={valorTemp} onChange={e => setValorTemp(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') salvarValor(conta); if (e.key === 'Escape') setEditando(null) }}
              style={{ background: 'var(--card)', border: '1px solid var(--verde)', borderRadius: '4px', color: 'var(--text)', padding: '2px 8px', fontSize: '13px', width: '120px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }} />
            <button onClick={() => salvarValor(conta)} style={{ marginLeft: '6px', background: 'var(--verde)', border: 'none', borderRadius: '4px', color: '#fff', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
          </span>
        ) : (
          <span onClick={() => { setEditando(conta.id); setValorTemp(valor ? String(valor) : '') }}
            title="Clique para editar"
            style={{ cursor: 'pointer', color: valor ? 'var(--text)' : 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', display: 'inline-block', minWidth: '60px', textAlign: 'right' }}>
            {valor ? fmt(valor) : '—'}
          </span>
        )}
      </td>
      <td style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--textMuted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
        {base && base !== 0 ? ((valor / base) * 100).toFixed(1) + '%' : '—'}
      </td>
      <td colSpan={2} style={{ padding: '7px 8px' }}></td>
    </tr>
  )
}