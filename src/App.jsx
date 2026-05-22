import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

function App() {
  const [competencia, setCompetencia] = useState(() => {
    const hoje = new Date()
    return {
      mes: hoje.getMonth() + 1,
      ano: hoje.getFullYear()
    }
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header competencia={competencia} setCompetencia={setCompetencia} />
        <main style={{ flex: 1, padding: '24px', color: 'var(--text)' }}>
          <p style={{ color: 'var(--textSub)' }}>Selecione um módulo no menu lateral.</p>
        </main>
      </div>
    </div>
  )
}

export default App