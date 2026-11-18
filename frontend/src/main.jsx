import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LegalPage, LEGAL_SLUGS } from './pages/LegalPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { installAccessHeader } from './access.js'

installAccessHeader()

// /privacy and /terms are policy pages, /admin is the private access manager
// (vercel.json rewrites unknown paths to index.html).
const slug = window.location.pathname.replace(/^\/+|\/+$/g, '')

function Root() {
  if (slug === 'admin') return <AdminPage />
  if (LEGAL_SLUGS.includes(slug)) return <LegalPage slug={slug} />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
