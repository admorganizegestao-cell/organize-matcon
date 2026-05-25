import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DRE from './components/DRE'
import BP from './components/BP'
import DFC from './components/DFC'
import CicloCaixa from './components/CicloCaixa'

function App() {
  const [modulo, setModulo] = useState('dre')
  const [competencia, setCompetencia] = useState(() => {
    const hoje = new Date()
    return { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() }
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar modulo={modulo} setModulo={setModulo} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header competencia={competencia} setCompetencia={setCompetencia} />
        <main style={{ flex: 1, padding: '24px', color: 'var(--text)' }}>
          {modulo === 'dre' && <DRE competencia={competencia} />}
          {modulo === 'bp' && <BP competencia={competencia} />}
          {modulo === 'dfc' && <DFC competencia={competencia} />}
          {modulo === 'ciclo' && <CicloCaixa competencia={competencia} />}
          {!['dre','bp','dfc','ciclo'].includes(modulo) && (
            <p style={{ color: 'var(--textSub)' }}>Módulo em construção.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App