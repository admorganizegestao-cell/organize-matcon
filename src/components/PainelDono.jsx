import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—'
  const abs = Math.abs(v)
  if (abs >= 1000000) return (v < 0 ? '-' : '') + 'R$ ' + (abs / 1000000).toFixed(1) + 'M'
  if (abs >= 1000) return (v < 0 ? '-' : '') + 'R$ ' + (abs / 1000).toFixed(1) + 'k'
  return (v < 0 ? '(R$ ' : 'R$ ') + abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + (v < 0 ? ')' : '')
}

const fmtPct = (v) => (!v || isNaN(v) || !isFinite(v)) ? '—' : v.toFixed(1) + '%'
const fmtDias = (v) => (!v || isNaN(v) || !isFinite(v)) ? '—' : v.toFixed(0) + 'd'
const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
function diasDoMes(mes, ano) { return new Date(ano, mes, 0).getDate() }

export default function PainelDono({ competencia }) {
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

    const { data: dreContas } = await supabase.from('dre_contas').select('*').eq('ativo', true)
    const { data: dreLanc } = await supabase.from('dre_lancamentos').select('*').eq('competencia_id', comp.id)
    const dreMap = {}
    ;(dreLanc || []).forEach(l => { dreMap[l.conta_id] = parseFloat(l.valor || 0) })

    const { data: bpContas } = await supabase.from('bp_contas').select('*').eq('ativo', true)
    const { data: bpLanc } = await supabase.from('bp_lancamentos').select('*').eq('competencia_id', comp.id)
    const bpMap = {}
    ;(bpLanc || []).forEach(l => { bpMap[l.conta_id] = parseFloat(l.valor || 0) })

    const getBP = (cod) => { const c = (bpContas||[]).find(c=>c.codigo===cod); return c ? (bpMap[c.id]||0) : 0 }
    const getDRECod = (cod) => { const c = (dreContas||[]).find(c=>c.codigo===cod); return c ? (dreMap[c.id]||0) : 0 }

    const receitaBruta = (dreContas||[]).filter(c=>c.tipo==='receita').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const deducoes = (dreContas||[]).filter(c=>c.tipo==='deducao').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const receitaLiquida = receitaBruta - deducoes
    const cmv = getDRECod('3.01')+getDRECod('3.02')+getDRECod('3.03')-getDRECod('3.04')-getDRECod('3.05')
    const lucroBruto = receitaLiquida - cmv
    const gruposDespesa = ['RH','CUSTO COM VENDAS','DESPESAS ADMINISTRATIVAS','DESPESAS COMERCIAIS','MARKETING','DESPESAS ESTRUTURAIS','ENTREGA / LOGÍSTICA','SEGURANÇA DO TRABALHO']
    const totalDespesas = (dreContas||[]).filter(c=>c.tipo==='despesa').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const ebitda = lucroBruto - totalDespesas
    const financeiro = (dreContas||[]).filter(c=>c.tipo==='financeiro').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const complementar = (dreContas||[]).filter(c=>c.tipo==='complementar').reduce((a,c)=>a+(dreMap[c.id]||0),0)
    const lucroLiquido = ebitda - financeiro + complementar

    const caixa = getBP('A.01') + getBP('A.02')
    const contasReceber = getBP('A.04')
    const estoques = getBP('A.06')
    const fornecedores = getBP('P.01')
    const emprestimosCP = getBP('P.09')
    const emprestimosLP = getBP('P.12')
    const endividamento = emprestimosCP + emprestimosLP

    const dias = diasDoMes(competencia.mes, competencia.ano)
    const pmr = receitaBruta > 0 ? (contasReceber / receitaBruta) * dias : 0
    const pmp = cmv > 0 ? (fornecedores / cmv) * dias : 0
    const pme = cmv > 0 ? (estoques / cmv) * dias : 0
    const ncg = contasReceber + estoques - fornecedores
    const cicloCaixa = pmr + pme - pmp

    const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0
    const margemEbitda = receitaLiquida > 0 ? (ebitda / receitaLiquida) * 100 : 0
    const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0

    const dadosResultado = [
      { name: 'Rec. Bruta', valor: receitaBruta },
      { name: 'Rec. Líquida', valor: receitaLiquida },
      { name: 'Lucro Bruto', valor: lucroBruto },
      { name: 'EBITDA', valor: ebitda },
      { name: 'Lucro Líq.', valor: lucroLiquido },
    ]

    const dadosDespesas = gruposDespesa.map(g => ({
      name: g.replace('DESPESAS ', '').replace(' / ', '/'),
      valor: (dreContas||[]).filter(c=>c.grupo===g).reduce((a,c)=>a+(dreMap[c.id]||0),0)
    })).filter(d => d.valor > 0)

    const dadosPrazos = [
      { name: 'PMR', valor: parseFloat(pmr.toFixed(1)), cor: '#3B82F6' },
      { name: 'PME', valor: parseFloat(pme.toFixed(1)), cor: '#E8920A' },
      { name: 'PMP', valor: parseFloat(pmp.toFixed(1)), cor: '#00A651' },
    ]

    setDados({ receitaBruta, receitaLiquida, lucroBruto, ebitda, lucroLiquido, caixa, endividamento, ncg, cicloCaixa, pmr, pmp, pme, margemBruta, margemEbitda, margemLiquida, dadosResultado, dadosDespesas, dadosPrazos })
    setLoading(false)
  }

  if (loading) return <div style={{ color: 'var(--textSub)', padding: '24px' }}>Carregando Painel do Dono...</div>
  if (erro) return <div style={{ color: 'var(--danger)', padding: '24px' }}>{erro}</div>

  const { receitaBruta, receitaLiquida, lucroBruto, ebitda, lucroLiquido, caixa, endividamento, ncg, cicloCaixa, pmr, pmp, pme, margemBruta, margemEbitda, margemLiquida, dadosResultado, dadosDespesas, dadosPrazos } = dados
  const CORES_PIE = ['#3B82F6','#E8920A','#00A651','#F04545','#8B5CF6','#06B6D4','#F59E0B','#10B981']
  const tooltipStyle = { background: '#101828', border: '1px solid #1C2A40', borderRadius: '6px', color: '#E8EDF5', fontSize: '12px' }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Painel do Dono</h2>
          <div style={{ fontSize: '13px', color: 'var(--textSub)' }}>{meses[competencia.mes - 1]}/{competencia.ano} — E&M Carvalho Material de Construção</div>
        </div>
        <button onClick={() => window.print()}
          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer', background: 'var(--card)', color: 'var(--textSub)' }}>
          🖨️ PDF
        </button>
      </div>

      {/* KPIs RESULTADO — 6 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '11px', marginBottom: '20px' }}>
        <KPICard label="Receita Bruta" valor={fmt(receitaBruta)} cor="var(--verde)" sub="Faturamento bruto" />
        <KPICard label="Receita Líquida" valor={fmt(receitaLiquida)} cor="var(--verde)" sub="Após impostos" />
        <KPICard label="Lucro Bruto" valor={fmt(lucroBruto)} cor={lucroBruto>=0?'var(--verde)':'var(--danger)'} sub={`MB: ${fmtPct(margemBruta)}`} />
        <KPICard label="EBITDA" valor={fmt(ebitda)} cor={ebitda>=0?'var(--verde)':'var(--danger)'} sub={`ME: ${fmtPct(margemEbitda)}`} destaque={ebitda>=0} />
        <KPICard label="Lucro Líquido" valor={fmt(lucroLiquido)} cor={lucroLiquido>=0?'var(--verde)':'var(--danger)'} sub={`ML: ${fmtPct(margemLiquida)}`} destaque={lucroLiquido>=0} />
        <KPICard label="Saldo de Caixa" valor={fmt(caixa)} cor={caixa>=0?'var(--verde)':'var(--danger)'} sub="Caixa + Bancos" />
      </div>

      {/* GRÁFICOS LINHA 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>CASCATA DE RESULTADO</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosResultado} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#6B7FA3', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
              <Bar dataKey="valor" radius={[4,4,0,0]}>
                {dadosResultado.map((e, i) => <Cell key={i} fill={e.valor >= 0 ? '#00A651' : '#F04545'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>COMPOSIÇÃO DAS DESPESAS</div>
          {dadosDespesas.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dadosDespesas} dataKey="valor" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                  {dadosDespesas.map((_, i) => <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#6B7FA3' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--textMuted)', fontSize: '13px' }}>
              Lance despesas na DRE para visualizar
            </div>
          )}
        </div>
      </div>

      {/* MARGENS + CAPITAL DE GIRO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Margens */}
        <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '16px' }}>MARGENS</div>
          <BarraMargem label="Margem Bruta" valor={margemBruta} referencia={30} />
          <BarraMargem label="Margem EBITDA" valor={margemEbitda} referencia={10} />
          <BarraMargem label="Margem Líquida" valor={margemLiquida} referencia={5} />
        </div>

        {/* Capital de Giro */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px' }}>
            <KPICard label="Ciclo de Caixa" valor={fmtDias(cicloCaixa)} cor={cicloCaixa<=30?'var(--verde)':cicloCaixa<=60?'var(--warning)':'var(--danger)'} sub="PMR+PME−PMP" />
            <KPICard label="NCG" valor={fmt(ncg)} cor={ncg<=0?'var(--verde)':'var(--warning)'} sub="Necessidade de Giro" />
            <KPICard label="Endividamento" valor={fmt(endividamento)} cor={endividamento===0?'var(--verde)':'var(--warning)'} sub="Empréstimos CP+LP" />
            <KPICard label="PMR/PME/PMP" valor={`${fmtDias(pmr)}/${fmtDias(pme)}/${fmtDias(pmp)}`} cor="var(--accent)" sub="Prazos médios" />
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px', flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--textMuted)', letterSpacing: '1px', marginBottom: '12px' }}>PRAZOS MÉDIOS (dias)</div>
            <ResponsiveContainer width="100%" height={120}>
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
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
        💡 Todos os indicadores calculados automaticamente a partir dos lançamentos de {meses[competencia.mes - 1]}/{competencia.ano}.
      </div>
    </div>
  )
}

function KPICard({ label, valor, cor, sub, destaque }) {
  return (
    <div style={{ background: destaque ? 'rgba(0,166,81,0.05)' : 'var(--card)', border: `1px solid ${destaque ? 'rgba(0,166,81,0.3)' : 'var(--border)'}`, borderRadius: '8px', padding: '14px', borderTop: `3px solid ${cor}` }}>
      <div style={{ fontSize: '10px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '0.3px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '18px', color: cor, marginBottom: '4px' }}>{valor}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--textMuted)' }}>{sub}</div>}
    </div>
  )
}

function BarraMargem({ label, valor, referencia }) {
  const cor = valor >= referencia ? 'var(--verde)' : valor >= referencia * 0.7 ? 'var(--warning)' : 'var(--danger)'
  const width = Math.min(Math.max(valor, 0), 100)
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'var(--textSub)' }}>{label}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: cor }}>{fmtPct(valor)}</span>
      </div>
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', width: `${width}%`, background: cor, borderRadius: '3px', transition: 'width 0.5s' }} />
        <div style={{ position: 'absolute', top: 0, left: `${referencia}%`, width: '2px', height: '100%', background: 'var(--textMuted)', opacity: 0.5 }} />
      </div>
      <div style={{ fontSize: '10px', color: 'var(--textMuted)', marginTop: '3px' }}>Ref: {referencia}%</div>
    </div>
  )
}