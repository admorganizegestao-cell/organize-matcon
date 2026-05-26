const menu = [
  { id: 'dre', label: 'DRE', fase: 1 },
  { id: 'bp', label: 'Balanço Patrimonial', fase: 1 },
  { id: 'dfc', label: 'Fluxo de Caixa', fase: 1 },
  { id: 'ciclo', label: 'Ciclo de Caixa / NCG', fase: 1 },
  { id: 'lucro', label: 'Destinação do Lucro', fase: 1 },
  { id: 'painel', label: 'Painel do Dono', fase: 1 },
  { id: 'despesas', label: 'Análise de Despesas', fase: 1 },
  { id: 'diagnostico', label: 'Diagnóstico Financeiro', fase: 2 },
  { id: 'rh', label: 'RH', fase: 2 },
  { id: 'vendas', label: 'Vendas / Metas', fase: 2 },
  { id: 'marketing', label: 'Marketing', fase: 2 },
  { id: 'pricing', label: 'Pricing', fase: 2 },
]

export default function Sidebar({ modulo, setModulo }) {
  const fase1 = menu.filter(m => m.fase === 1)
  const fase2 = menu.filter(m => m.fase === 2)

  return (
    <aside style={{
      width: '230px',
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--verde)', fontWeight: 700, fontSize: '16px' }}>Organize</span>
        <span style={{ color: 'var(--textSub)', fontSize: '12px', display: 'block' }}>MatCon — E&M Carvalho</span>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ padding: '6px 20px', fontSize: '10px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '1px' }}>
          FASE 1 — GERENCIAL
        </div>
        {fase1.map(item => (
          <MenuItem key={item.id} item={item} modulo={modulo} setModulo={setModulo} ativo={true} />
        ))}
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ padding: '6px 20px', fontSize: '10px', color: 'var(--textMuted)', fontWeight: 600, letterSpacing: '1px' }}>
          FASE 2 — OPERACIONAL
        </div>
        {fase2.map(item => (
          <MenuItem key={item.id} item={item} modulo={modulo} setModulo={setModulo} ativo={false} />
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--textMuted)', fontSize: '11px' }}>Organize Consultoria</span>
        <span style={{ color: 'var(--textMuted)', fontSize: '10px', display: 'block' }}>v1.0 — 2026</span>
      </div>
    </aside>
  )
}

function MenuItem({ item, modulo, setModulo, ativo }) {
  const selecionado = modulo === item.id
  return (
    <div
      onClick={() => ativo && setModulo(item.id)}
      style={{
        padding: '9px 20px',
        color: selecionado ? 'var(--verde)' : ativo ? 'var(--textSub)' : 'var(--textMuted)',
        background: selecionado ? 'var(--verdeDim)' : 'transparent',
        borderLeft: selecionado ? '2px solid var(--verde)' : '2px solid transparent',
        cursor: ativo ? 'pointer' : 'default',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.15s',
        opacity: ativo ? 1 : 0.4,
      }}>
      {item.label}
      {!ativo && <span style={{ fontSize: '9px', background: 'var(--border)', color: 'var(--textMuted)', padding: '2px 6px', borderRadius: '4px' }}>Em breve</span>}
    </div>
  )
}