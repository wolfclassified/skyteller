import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ActiveLocationProvider } from './context/ActiveLocationContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ActiveLocationProvider>
    <App />
    </ActiveLocationProvider>
  </StrictMode>,
)
