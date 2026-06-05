import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './site.css'
import MarketingSite from './MarketingSite.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MarketingSite />
  </StrictMode>,
)
