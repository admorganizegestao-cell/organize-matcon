import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  const str = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return v < 0 ? `(R$ ${str})` : `R$ ${str}`
}

const fmtDias = (v) => {
  if (!v || isNaN(v) || !isFinite(v)) return '—'
  return v.toFixed(1) + ' dias'
}

const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function diasDoMes(mes, ano) {
  return new Date(ano, mes, 0).getDate()
}

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

    // Buscar contas BP
    const { data: bpContas } = await supabase.from('bp_contas').select('*').eq('ativo', true)
    const { data: bpLanc } = await supabase.from('bp_lancamentos').select('*').eq('competencia_id', comp.id)

    // Buscar contas DRE
    const { data: dreContas } = await supabase.from('dre_contas').select('*').eq('ativo', true)
    const { data: dreLanc } = await supabase.from('dre_lancamentos').select('*').eq('competencia_id', comp.id)

    // Mapear lançamentos
    const bpMap = {}
    ;(bpLanc || []).forEach(l => { bpMap[l.conta_id] = parseFloat(l.valor || 0) })

    const dreMap = {}
    ;(dreLanc || []).forEach(l => { dreMap[l.conta_id] = parseFloat(l.valor || 0) })

    const getBP = (codigo) => {
      const conta = (bpContas || []).find(c => c.codigo === codigo)
      return conta ? (bpMap[conta.id] || 0) : 0
    }

    const getDRE = (codigo) => {
      const conta = (dreContas || []).find(c => c.codigo === codigo)
      return conta ? (dreMap[conta.id] || 0) : 0
    }

    // Valores do BP
    const contasReceber = getBP('A.04')
    const estoques = getBP('A.06')
    const fornecedores = getBP('P.01')

    // Valores da DRE
    const receitaBruta = (dreContas || [])
      .filter(c => c.tipo === 'receita')
      .reduce((acc, c) => acc + (dreMap[c.id] || 0), 0)

    const estoqueInicial = getDRE('3.01')
    const compras = getDRE('3.02')
    const fretes = getDRE('3.03')
    const devCompras = getDRE('3.04')
    const estoqueFinal = getDRE('3.05')
    const cmv = estoqueInicial + compras + fretes - devCompras - estoqueFinal

    const dias = diasDoMes(competencia.mes, competencia.ano)

    // Cálculos
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

  return (
    <div style={{ maxWidth: '800px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '11px', marginBottom: '24px' }}>
        <Card label="PMR" sublabel="Prazo Médio de Recebimento" valor={fmtDias(pmr)} cor="var(--accent)" />
        <Card label="PME" sublabel="Prazo Médio de Estoque" valor={fmtDias(pme)} cor="var(--warning)" />
        <Card label="PMP" sublabel="Prazo Médio de Pagamento" valor={fmtDias(pmp)} cor="var(--verde)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px', marginBottom: '24px' }}>
        <Card label="Ciclo de Caixa" sublabel="PMR + PME − PMP" valor={fmtDias(cicloCaixa)} cor={corCiclo} grande />
        <Card label="NCG" sublabel="Necessidade de Capital de Giro" valor={fmt(ncg)} cor={corNCG} grande />
      </div>

      {/* TABELA DE MEMÓRIA DE CÁLCULO */}
      <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '12px' }}>
          MEMÓRIA DE CÁLCULO
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            <LinhaCalc label="Contas a Receber (BP A.04)" valor={fmt(contasReceber)} />
            <LinhaCalc label="Estoques (BP A.06)" valor={fmt(estoques)} />
            <LinhaCalc label="Fornecedores (BP P.01)" valor={fmt(fornecedores)} />
            <LinhaCalc label="Receita Bruta (DRE)" valor={fmt(receitaBruta)} />
            <LinhaCalc label="CMV Apurado (DRE)" valor={fmt(cmv)} />
            <LinhaCalc label={`Dias do mês (${meses[competencia.mes - 1]})`} valor={dias + ' dias'} />
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td style={{ padding: '8px 4px', color: 'var(--textSub)', fontSize: '12px' }}>
                PMR = (CR ÷ Receita Bruta) × {dias}
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--accent)' }}>
                {fmtDias(pmr)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 4px', color: 'var(--textSub)', fontSize: '12px' }}>
                PME = (Estoque ÷ CMV) × {dias}
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--warning)' }}>
                {fmtDias(pme)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 4px', color: 'var(--textSub)', fontSize: '12px' }}>
                PMP = (Fornecedores ÷ CMV) × {dias}
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--verde)' }}>
                {fmtDias(pmp)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td style={{ padding: '8px 4px', color: 'var(--text)', fontWeight: 700, fontSize: '12px' }}>
                NCG = CR + Estoque − Fornecedores
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '13px', color: corNCG }}>
                {fmt(ncg)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 4px', color: 'var(--text)', fontWeight: 700, fontSize: '12px' }}>
                Ciclo de Caixa = PMR + PME − PMP
              </td>
              <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '13px', color: corCiclo }}>
                {fmtDias(cicloCaixa)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--textMuted)' }}>
        💡 Dados calculados automaticamente a partir do BP e DRE lançados para {meses[competencia.mes - 1]}/{competencia.ano}.
      </div>
    </div>
  )
}

function Card({ label, sublabel, valor, cor, grande }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px',
      padding: grande ? '20px' : '16px', borderTop: `3px solid ${cor}`
    }}>
      <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: grande ? '28px' : '22px', fontWeight: 700, color: cor, fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>{valor}</div>
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