import React, { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, MessageCircle, RefreshCw, ShieldCheck, UserPlus, X } from 'lucide-react';
import { KreomaxIcon } from '../components/KreomaxLogo';
import './AdminPage.css';

const TOKEN_KEY = 'kreomax.admin.token';

const digitsFor = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};
const when = (t) => (t ? new Date(t * (t > 1e12 ? 1 : 1000)).toLocaleString() : '-');

function messageFor(rec) {
  return `Hi ${rec.name}, your Kreomax studio access is ready!\n\n1. Open ${window.location.origin}\n2. Tap "Launch Studio"\n3. Enter your access code: ${rec.display}\n\nSee you inside!`;
}
const waLink = (rec) => {
  const d = digitsFor(rec.phone);
  return `https://wa.me/${d}?text=${encodeURIComponent(messageFor(rec))}`;
};

export function AdminPage() {
  const [token, setToken] = useState(() => { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } });
  const [draft, setDraft] = useState('');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [access, setAccess] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState(null); // the code just created, shown with the WhatsApp message
  const [form, setForm] = useState({ name: '', phone: '', note: '' });
  const [copied, setCopied] = useState('');

  useEffect(() => {
    document.title = 'Admin | Kreomax';
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow';
  }, []);

  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token, ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = res.status === 401 ? 'That admin token is not correct.'
        : res.status === 503 ? 'Admin is only available on your own computer. Start the backend there with ADMIN_LOCAL=1 in backend/.env, and open this page from the same computer.'
          : (typeof data.detail === 'string' ? data.detail : 'Something went wrong.');
      throw Object.assign(new Error(message), { status: res.status });
    }
    return data;
  }, [token]);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [apps, acc] = await Promise.all([api('/api/admissions/list'), api('/api/admin/access')]);
      setRequests([...(apps.applications || [])].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      setAccess(acc.access || []);
      setAuthed(true);
    } catch (e) {
      setAuthed(false);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [api]);

  // On your own computer no password is needed, so always try straight away.
  useEffect(() => { load(); }, [token, load]);

  const unlock = (e) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    setToken(t);
  };
  const lock = () => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken(''); setAuthed(false); setDraft('');
  };

  const create = async (payload) => {
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/admin/access', { method: 'POST', body: JSON.stringify(payload) });
      setIssued(data.access);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (code, action) => {
    setError('');
    try {
      await api(`/api/admin/access/${code}/${action}`, { method: 'POST' });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1500); } catch { /* clipboard blocked */ }
  };

  const codeFor = (applicationId) => access.find((a) => a.applicationId === applicationId);

  if (!authed) {
    return (
      <div className="ad">
        <div className="ad-lock">
          <KreomaxIcon size={44} />
          <h1>Admin</h1>
          <p>Admin opens on the computer where admin mode is switched on. If you set an admin password instead, enter it below.</p>
          <form onSubmit={unlock}>
            <input type="password" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Admin token" autoComplete="off" aria-label="Admin token" autoFocus />
            <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Checking...' : 'Unlock'}</button>
          </form>
          {error && <p className="ad-error" role="alert">{error}</p>}
          <a href="/">Back to the website</a>
        </div>
      </div>
    );
  }

  return (
    <div className="ad">
      <header className="ad-top">
        <div className="ad-brand"><KreomaxIcon size={30} /><strong>Studio access</strong><span className="ad-tag"><ShieldCheck size={13} /> admin</span></div>
        <div className="ad-top-actions">
          <button type="button" className="btn-secondary btn-sm" onClick={load} disabled={busy}><RefreshCw size={14} /> Refresh</button>
          <button type="button" className="btn-secondary btn-sm" onClick={lock}>Lock</button>
        </div>
      </header>

      <main className="ad-main">
        {error && <p className="ad-error" role="alert">{error}</p>}

        <div className="ad-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'requests'} className={tab === 'requests' ? 'on' : ''} onClick={() => setTab('requests')}>Requests <b>{requests.length}</b></button>
          <button role="tab" aria-selected={tab === 'access'} className={tab === 'access' ? 'on' : ''} onClick={() => setTab('access')}>Access codes <b>{access.length}</b></button>
          <button role="tab" aria-selected={tab === 'new'} className={tab === 'new' ? 'on' : ''} onClick={() => setTab('new')}><UserPlus size={14} /> New access</button>
        </div>

        {tab === 'requests' && (
          <section className="ad-card">
            <h2>Requests from the website</h2>
            {requests.length === 0 ? <p className="ad-empty">No requests yet.</p> : (
              <div className="ad-table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Phone</th><th>Programme</th><th>Grade</th><th>Received</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {requests.map((r) => {
                      const rec = codeFor(r.applicationId);
                      return (
                        <tr key={r.applicationId}>
                          <td data-label="Name"><strong>{r.studentName}</strong><small>{r.studentEmail}</small></td>
                          <td data-label="Phone">{r.studentPhone}</td>
                          <td data-label="Programme">{r.planName}</td>
                          <td data-label="Grade">{r.studentGrade}</td>
                          <td data-label="Received">{when(r.timestamp)}</td>
                          <td data-label="Status">{rec ? <span className={`ad-badge ${rec.status === 'active' ? 'ok' : 'off'}`}>{rec.status === 'active' ? 'Access given' : 'Switched off'}</span> : <span className="ad-badge new">New</span>}</td>
                          <td>
                            {rec ? (
                              <a className="btn-secondary btn-sm" href={waLink(rec)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> Resend</a>
                            ) : (
                              <button type="button" className="btn-primary btn-sm" disabled={busy}
                                onClick={() => create({ name: r.studentName, phone: r.studentPhone, applicationId: r.applicationId })}>
                                <KeyRound size={14} /> Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'access' && (
          <section className="ad-card">
            <h2>Access codes</h2>
            {access.length === 0 ? <p className="ad-empty">No codes yet. Approve a request or create one.</p> : (
              <div className="ad-table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Phone</th><th>Code</th><th>Status</th><th>Last used</th><th>Uses</th><th /></tr></thead>
                  <tbody>
                    {access.map((a) => (
                      <tr key={a.code}>
                        <td data-label="Name"><strong>{a.name}</strong>{a.note && <small>{a.note}</small>}</td>
                        <td data-label="Phone">{a.phone || '-'}</td>
                        <td data-label="Code"><code>{a.display}</code> <button type="button" className="ad-icon" onClick={() => copy(a.display, a.code)} aria-label="Copy code"><Copy size={13} />{copied === a.code ? ' copied' : ''}</button></td>
                        <td data-label="Status"><span className={`ad-badge ${a.status === 'active' ? 'ok' : 'off'}`}>{a.status === 'active' ? 'Active' : 'Switched off'}</span></td>
                        <td data-label="Last used">{when(a.lastUsedAt)}</td>
                        <td data-label="Uses">{a.uses}</td>
                        <td className="ad-actions">
                          <a className="btn-secondary btn-sm" href={waLink(a)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</a>
                          {a.status === 'active'
                            ? <button type="button" className="btn-secondary btn-sm ad-danger" onClick={() => setStatus(a.code, 'revoke')}>Switch off</button>
                            : <button type="button" className="btn-secondary btn-sm" onClick={() => setStatus(a.code, 'restore')}>Switch on</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'new' && (
          <section className="ad-card ad-form-card">
            <h2>Create access for someone</h2>
            <p className="ad-empty">For people who registered on WhatsApp or in person.</p>
            <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) { create(form); setForm({ name: '', phone: '', note: '' }); } }}>
              <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} /></label>
              <label>WhatsApp number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" placeholder="98765 43210" maxLength={20} /></label>
              <label>Note (optional)<input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={300} placeholder="e.g. Weekend cohort, Green Valley School" /></label>
              <button type="submit" className="btn-primary" disabled={busy}><KeyRound size={15} /> Create code</button>
            </form>
          </section>
        )}
      </main>

      {issued && (
        <div className="ad-modal" role="dialog" aria-modal="true" aria-label="Access code created">
          <div className="ad-modal-card">
            <button type="button" className="ad-x" onClick={() => setIssued(null)} aria-label="Close"><X size={16} /></button>
            <h2>Access ready for {issued.name}</h2>
            <p className="ad-code">{issued.display}</p>
            <pre className="ad-msg">{messageFor(issued)}</pre>
            <div className="ad-modal-actions">
              <a className="btn-primary" href={waLink(issued)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> Send on WhatsApp</a>
              <button type="button" className="btn-secondary" onClick={() => copy(messageFor(issued), 'msg')}><Copy size={14} /> {copied === 'msg' ? 'Copied' : 'Copy message'}</button>
            </div>
            {!issued.phone && <p className="ad-note">No phone number was saved, so WhatsApp will ask you to choose the contact.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
