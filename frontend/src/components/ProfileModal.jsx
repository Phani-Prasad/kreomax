import React, { useEffect, useRef, useState } from 'react';
import { GRADES } from '../data/workspace';
import { Avatar } from './Avatar';
import './ProfileModal.css';

/** First-run welcome and "edit profile" dialog. Everything is optional except a name to show. */
export function ProfileModal(props) {
  if (!props.isOpen) return null;
  return <ProfileForm {...props} />;
}

function ProfileForm({ initial, canDismiss, onSave, onSkip, onClose }) {
  const [name, setName] = useState(initial?.name && !initial?.skipped ? initial.name : '');
  const [grade, setGrade] = useState(initial?.grade || '');
  const [school, setSchool] = useState(initial?.school || '');
  const nameRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && canDismiss) { onClose(); return; }
    if (e.key !== 'Tab') return;
    const items = cardRef.current?.querySelectorAll('input, select, button:not([disabled])');
    if (!items || items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { nameRef.current?.focus(); return; }
    onSave({ name: trimmed, grade, school: school.trim() });
  };

  return (
    <div className="pm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && canDismiss) onClose(); }} onKeyDown={onKeyDown}>
      <div className="pm-card" ref={cardRef} role="dialog" aria-modal="true" aria-labelledby="pm-title">
        <div className="pm-head">
          <Avatar name={name || '?'} size={52} />
          <div>
            <h2 id="pm-title">{canDismiss ? 'Your profile' : 'Welcome to your workspace'}</h2>
            <p>{canDismiss ? 'Update the details shown on your certificate and projects.' : 'Tell us what to call you. This appears on your projects and certificate.'}</p>
          </div>
        </div>

        <form onSubmit={submit} className="pm-form">
          <label className="pm-field">
            <span>Your name</span>
            <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" placeholder="e.g. Maya Rao" required />
          </label>
          <div className="pm-row">
            <label className="pm-field">
              <span>Grade <em>(optional)</em></span>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">Select</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="pm-field">
              <span>School <em>(optional)</em></span>
              <input value={school} onChange={(e) => setSchool(e.target.value)} maxLength={80} autoComplete="organization" placeholder="School name" />
            </label>
          </div>
          <p className="pm-note">Saved on this device only. Please do not enter anything private beyond your name.</p>
          <div className="pm-actions">
            {canDismiss ? (
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            ) : (
              <button type="button" className="btn-secondary" onClick={onSkip}>Skip for now</button>
            )}
            <button type="submit" className="btn-primary">{canDismiss ? 'Save' : 'Start creating'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
