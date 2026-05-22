const menu = [
  { id: 'dre', label: 'DRE' },
  { id: 'bp', label: 'Balanço Patrimonial' },
  { id: 'dfc', label: 'Fluxo de Caixa' },
  { id: 'ciclo', label: 'Ciclo de Caixa' },
  { id: 'lucro', label: 'Para Onde Foi o Lucro' },
  { id: 'painel', label: 'Painel do Dono' },
]

export default function Sidebar({ modulo, setModulo }) {
  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--verde)', fontWeight: 700, fontSize: '16px' }}>Organize</span>
        <span style={{ color: 'var(--textSub)', fontSize: '12px', display: 'block' }}>MatCon</span>
      </div>
      <nav style={{ marginTop: '16px' }}>
        {menu.map(item => (
          <div key={item.id}
            onClick={() => setModulo(item.id)}
            style={{
              padding: '10px 20px',
              color: modulo === item.id ? 'var(--verde)' : 'var(--textSub)',
              background: modulo === item.id ? 'var(--verdeDim)' : 'transparent',
              borderLeft: modulo === item.id ? '2px solid var(--verde)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.15s',
            }}>
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  )
}