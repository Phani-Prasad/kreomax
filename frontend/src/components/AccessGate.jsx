import React, { useEffect, useRef, useState } from 'react';
import { KeyRound, MessageCircle, X } from 'lucide-react';
import { verifyAccess } from '../access';
import { whatsappLink } from '../data/contact';
import './AccessGate.css';

/** "Launch Studio" asks for the personal code the Kreomax team sent after approving a request. */
export function AccessGate({ isOpen, onClose, onGranted }) {
  if (!isOpen) return null;
  return <GateForm onClose={onClose} onGranted={onGranted} />;
}

function GateForm({ onClose, onGranted }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // show the code as ABCD-2345 while typing
  const onChange = (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setValue(raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const access = await verifyAccess(value);
      onGranted(access);
    } catch (err) {
      setError(err.message);
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="ag-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div className="ag-card" role="dialog" aria-modal="true" aria-labelledby="ag-title">
        <button type="button" className="ag-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <span className="ag-icon" aria-hidden="true"><KeyRound size={26} /></span>
        <h2 id="ag-title">Enter your studio code</h2>
        <p className="ag-sub">The studio is open to registered students. Use the personal code the Kreomax team sent you.</p>

        <form onSubmit={submit} className="ag-form">
          <label htmlFor="ag-code" className="ag-label">Access code</label>
          <input
            id="ag-code" ref={inputRef} value={value} onChange={onChange} inputMode="text" autoComplete="off" autoCapitalize="characters"
            spellCheck="false" placeholder="ABCD-2345" aria-invalid={Boolean(error)} aria-describedby={error ? 'ag-error' : undefined}
          />
          {error && <p id="ag-error" className="ag-error" role="alert">{error}</p>}
          <button type="submit" className="btn-primary ag-submit" disabled={busy || value.length < 9}>
            {busy ? 'Checking...' : 'Open the studio'}
          </button>
        </form>

        <div className="ag-help">
          <span>No code yet?</span>
          <a
            href={whatsappLink('Hi Kreomax, I would like access to the studio. My name is ')}
            target="_blank" rel="noopener noreferrer"
          >
            <MessageCircle size={15} aria-hidden="true" /> Request access on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
