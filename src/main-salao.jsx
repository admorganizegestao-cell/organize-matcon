import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import SalaoApp from './SalaoApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SalaoApp />
  </StrictMode>,
)
