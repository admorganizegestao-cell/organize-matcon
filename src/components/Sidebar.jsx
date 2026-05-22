const menu = [
  { id: 'dre', label: 'DRE' },
  { id: 'bp', label: 'Balanço Patrimonial' },
  { id: 'dfc', label: 'Fluxo de Caixa' },
  { id: 'ciclo', label: 'Ciclo de Caixa' },
  { id: 'lucro', label: 'Para Onde Foi o Lucro' },
  { id: 'painel', label: 'Painel do Dono' },
]

export default function Sidebar() {
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
          <div key={item.id} style={{
            padding: '10px 20px',
            color: 'var(--textSub)',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  )
}