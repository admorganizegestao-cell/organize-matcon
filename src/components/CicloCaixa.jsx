import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from 'recharts'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  const str = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return v < 0 ? `(R$ ${str})` : `R$ ${str}`
}

const fmtDias = (v) => (!v || isNaN(v) || !isFinite(v)) ? '—' : v.toFixed(1) + ' dias'
const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function diasDoMes(mes, ano) { return new Date(ano, mes, 0).getDate() }

export default function CicloCaixa({ competencia }) {
  const [dados, setDados] = useState(null)
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

    const { data: bpContas } = await supabase.from('bp_contas').select('*').eq('ativo', true)
    const { data: bpLanc } = await supabase.from('bp_lancamentos').select('*').eq('competencia_id', comp.id)
    const { data: dreContas } = await supabase.from('dre_contas').select('*').eq('ativo', true)
    const { data: dreLanc } = await supabase.from('dre_lancamentos').select('*').eq('competencia_id', comp.id)

    const bpMap = {}
    ;(bpLanc || []).forEach(l => { bpMap[l.conta_id] = parseFloat(l.valor || 0) })
    const dreMap = {}
    ;(dreLanc || []).forEach(l => { dreMap[l.conta_id] = parseFloat(l.valor || 0) })

    const getBP = (cod) => { const c = (bpContas||[]).find(c=>c.codigo===cod); return c ? (bpMap[c.id]||0) : 0 }
    const getDRE = (cod) => { const c = (dreContas||[]).find(c=>c.codigo===cod); return c ? (dreMap[c.id]||0) : 0 }

    const contasReceber = getBP('A.04')
    const estoques = getBP('A.06')
    const fornecedores = getBP('P.01')

    const receitaBruta = (dreContas||[]).filter(c=>c.tipo==='receita').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const cmv = getDRE('3.01')+getDRE('3.02')+getDRE('3.03')-getDRE('3.04')-getDRE('3.05')

    const dias = diasDoMes(competencia.mes, competencia.ano)
    const pmr = receitaBruta > 0 ? (contasReceber / receitaBruta) * dias : 0
    const pmp = cmv > 0 ? (fornecedores / cmv) * dias : 0
    const pme = cmv > 0 ? (estoques / cmv) * dias : 0
    const ncg = contasReceber + estoques - fornecedores
    const cicloCaixa = pmr + pme - pmp

    setDados({ contasReceber, estoques, fornecedores, receitaBruta, cmv, pmr, pmp, pme, ncg, cicloCaixa, dias })
    setLoading(false)
  }

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Calculando Ciclo de Caixa...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  const { contasReceber, estoques, fornecedores, receitaBruta, cmv, pmr, pmp, pme, ncg, cicloCaixa, dias } = dados

  const corCiclo = cicloCaixa <= 30 ? 'var(--verde)' : cicloCaixa <= 60 ? 'var(--warning)' : 'var(--danger)'
  const corNCG = ncg <= 0 ? 'var(--verde)' : ncg <= 50000 ? 'var(--warning)' : 'var(--danger)'

  const dadosPrazos = [
    { name: 'PMR', valor: parseFloat(pmr.toFixed(1)), cor: '#3B82F6' },
    { name: 'PME', valor: parseFloat(pme.toFixed(1)), cor: '#E8920A' },
    { name: 'PMP', valor: parseFloat(pmp.toFixed(1)), cor: '#00A651' },
  ]

  const dadosNCG = [
    { name: 'Contas a Receber', valor: contasReceber, cor: '#3B82F6' },
    { name: 'Estoques', valor: estoques, cor: '#E8920A' },
    { name: 'Fornecedores', valor: fornecedores, cor: '#00A651' },
  ]

  const tooltipStyle = { background: '#101828', border: '1px solid #1C2A40', borderRadius: '6px', color: '#E8EDF5', fontSize: '12px' }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          Ciclo de Caixa / NCG — {meses[competencia.mes - 1]}/{competencia.ano}
        </h2>
        <button onClick={() => window.print()}
          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
          🖨️ PDF
        </button>
      </div>

      {/* CARDS PRINCIPAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '11px', marginBottom: '24px' }}>
        <Card label="PMR" sublabel="Prazo Médio Recebimento" valor={fmtDias(pmr)} cor="#3B82F6" />
        <Card label="PME" sublabel="Prazo Médio Estoque" valor={fmtDias(pme)} cor="#E8920A" />
        <Card label="PMP" sublabel="Prazo Médio Pagamento" valor={fmtDias(pmp)} cor="#00A651" />
        <Card label="Ciclo de Caixa" sublabel="PMR + PME − PMP" valor={fmtDias(cicloCaixa)} cor={corCiclo} destaque />
        <Card label="NCG" sublabel="Necessidade de Giro" valor={fmt(ncg)} cor={corNCG} destaque />
      </div>

      {/* GRÁFICOS + MEMÓRIA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

        {/* Gráfico Prazos */}
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>PRAZOS MÉDIOS (dias)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosPrazos} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#6B7FA3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => v + ' dias'} />
              <Bar dataKey="valor" radius={[4,4,0,0]}>
                {dadosPrazos.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico NCG */}
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>COMPOSIÇÃO DA NCG</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosNCG} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#6B7FA3', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
              <Bar dataKey="valor" radius={[4,4,0,0]}>
                {dadosNCG.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MEMÓRIA DE CÁLCULO */}
      <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '12px' }}>MEMÓRIA DE CÁLCULO</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            <LinhaCalc label="Contas a Receber (BP A.04)" valor={fmt(contasReceber)} />
            <LinhaCalc label="Estoques (BP A.06)" valor={fmt(estoques)} />
            <LinhaCalc label="Fornecedores (BP P.01)" valor={fmt(fornecedores)} />
            <LinhaCalc label="Receita Bruta (DRE)" valor={fmt(receitaBruta)} />
            <LinhaCalc label="CMV Apurado (DRE)" valor={fmt(cmv)} />
            <LinhaCalc label={`Dias do mês (${meses[competencia.mes - 1]})`} valor={dias + ' dias'} />
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td style={{ padding: '8px 4px', color: 'var(--textSub)', fontSize: '12px' }}>PMR = (CR ÷ Receita Bruta) × {dias}</td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#3B82F6' }}>{fmtDias(pmr)}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 4px', color: 'var(--textSub)', fontSize: '12px' }}>PME = (Estoque ÷ CMV) × {dias}</td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#E8920A' }}>{fmtDias(pme)}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 4px', color: 'var(--textSub)', fontSize: '12px' }}>PMP = (Fornecedores ÷ CMV) × {dias}</td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#00A651' }}>{fmtDias(pmp)}</td>
            </tr>
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td style={{ padding: '8px 4px', color: 'var(--text)', fontWeight: 700, fontSize: '12px' }}>NCG = CR + Estoque − Fornecedores</td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '13px', color: corNCG }}>{fmt(ncg)}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 4px', color: 'var(--text)', fontWeight: 700, fontSize: '12px' }}>Ciclo de Caixa = PMR + PME − PMP</td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '13px', color: corCiclo }}>{fmtDias(cicloCaixa)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Card({ label, sublabel, valor, cor, destaque }) {
  return (
    <div style={{ background: destaque ? 'rgba(0,166,81,0.05)' : 'var(--card)', border: `1px solid ${destaque ? 'rgba(0,166,81,0.2)' : 'var(--border)'}`, borderRadius: '8px', padding: '16px', borderTop: `3px solid ${cor}` }}>
      <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: cor, fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>{valor}</div>
      <div style={{ fontSize: '11px', color: 'var(--textMuted)' }}>{sublabel}</div>
    </div>
  )
}

function LinhaCalc({ label, valor }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '7px 4px', color: 'var(--textSub)', fontSize: '12px' }}>{label}</td>
      <td style={{ padding: '7px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)' }}>{valor}</td>
    </tr>
  )
}