const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const anos = [2023, 2024, 2025, 2026, 2027]

export default function Header({ competencia, setCompetencia }) {
  return (
    <header style={{
      height: '56px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '15px' }}>
        E&M Carvalho — Material de Construção
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--textSub)', fontSize: '13px' }}>Competência:</span>
        <select
          value={competencia.mes}
          onChange={e => setCompetencia(c => ({ ...c, mes: Number(e.target.value) }))}
          style={{
            background: 'var(--card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '13px',
          }}
        >
          {meses.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>

        <select
          value={competencia.ano}
          onChange={e => setCompetencia(c => ({ ...c, ano: Number(e.target.value) }))}
          style={{
            background: 'var(--card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '13px',
          }}
        >
          {anos.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
    </header>
  )
}