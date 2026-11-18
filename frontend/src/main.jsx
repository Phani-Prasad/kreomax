import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LegalPage, LEGAL_SLUGS } from './pages/LegalPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { installAccessHeader } from './access.js'

installAccessHeader()

// /privacy and /terms are policy pages. /admin (access manager) is available only in development.
// (vercel.json rewrites unknown paths to index.html).
const slug = window.location.pathname.replace(/^\/+|\/+$/g, '')

function Root() {
  // The admin page exists only when you run the project on your own computer (npm run dev).
  if (slug === 'admin' && import.meta.env.DEV) return <AdminPage />
  if (LEGAL_SLUGS.includes(slug)) return <LegalPage slug={slug} />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
