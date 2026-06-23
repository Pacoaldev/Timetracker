import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { persistCurrentState } from './store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

window.addEventListener('beforeunload', persistCurrentState)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    persistCurrentState()
  }
})
