import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import './KeyConfigModal.css';

export function KeyConfigModal({ 
  isOpen, 
  onClose, 
  gatewayStatus, 
  onKeysSaved 
}) {
  const [keysInput, setKeysInput] = useState({ gemini: '', openai: '', elevenlabs: '' });
  const [savingKey, setSavingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSaveKeys = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    setKeyFeedback(null);
    try {
      const resp = await fetch('/api/ai/gateway/save-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keysInput)
      });
      const data = await resp.json();
      setSavingKey(false);
      if (data.success) {
        setKeyFeedback({ type: 'success', message: data.message });
        if (onKeysSaved) onKeysSaved(data.status?.tools);
        setTimeout(() => {
          onClose();
          setKeyFeedback(null);
        }, 1600);
      } else {
        setKeyFeedback({ type: 'error', message: data.error || 'Failed to save gateway keys' });
      }
    } catch (err) {
      setSavingKey(false);
      setKeyFeedback({ type: 'error', message: 'Network error connecting to LMS server.' });
    }
  };

  return (
    <div className="ca-key-modal-backdrop" onClick={onClose}>
      <div className="ca-key-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ca-key-modal-header">
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-cyan" />
            <div>
              <h3 className="ca-key-title">Master AI Gateway (SSO)</h3>
              <p className="ca-key-sub">Single Sign-On proxy for all AI tools inside Kreomax</p>
            </div>
          </div>
          <button className="ca-key-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="ca-key-info-banner">
          <ShieldCheck size={16} className="text-emerald flex-shrink-0" />
          <p>
            <strong>Zero Student Logins:</strong> Keys entered here power Google NotebookLM, ChatGPT, Gemini, and ElevenLabs voices right inside the LMS!
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="ca-key-status-row">
          <div className="ca-status-tool">
            <span className="ca-status-tool-name">Google Gemini:</span>
            <span className={`ca-status-badge ${gatewayStatus?.gemini?.configured ? 'status-active' : 'status-pending'}`}>
              {gatewayStatus?.gemini?.configured ? 'Active ✓' : 'Sandbox Ready'}
            </span>
          </div>
          <div className="ca-status-tool">
            <span className="ca-status-tool-name">OpenAI ChatGPT:</span>
            <span className={`ca-status-badge ${gatewayStatus?.chatgpt?.configured ? 'status-active' : 'status-pending'}`}>
              {gatewayStatus?.chatgpt?.configured ? 'Active ✓' : 'Sandbox Ready'}
            </span>
          </div>
          <div className="ca-status-tool">
            <span className="ca-status-tool-name">ElevenLabs Voice:</span>
            <span className={`ca-status-badge ${gatewayStatus?.elevenlabs?.configured ? 'status-active' : 'status-pending'}`}>
              {gatewayStatus?.elevenlabs?.configured ? 'Active ✓' : 'Browser Synth'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveKeys} className="ca-key-form">
          <div className="ca-key-field">
            <label className="ca-key-label">
              <span>Google Gemini API Key (Free)</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer" 
                className="ca-key-link"
              >
                <span>Get Free Key</span>
                <ExternalLink size={11} />
              </a>
            </label>
            <input 
              type="password"
              className="ca-key-input"
              placeholder={gatewayStatus?.gemini?.configured ? "•••••••••••••••••••••••••••• (Saved)" : "AIzaSy..."}
              value={keysInput.gemini}
              onChange={(e) => setKeysInput(prev => ({ ...prev, gemini: e.target.value }))}
            />
          </div>

          <div className="ca-key-field">
            <label className="ca-key-label">
              <span>OpenAI API Key (Optional)</span>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer" 
                className="ca-key-link"
              >
                <span>OpenAI Keys</span>
                <ExternalLink size={11} />
              </a>
            </label>
            <input 
              type="password"
              className="ca-key-input"
              placeholder={gatewayStatus?.chatgpt?.configured ? "•••••••••••••••••••••••••••• (Saved)" : "sk-proj-..."}
              value={keysInput.openai}
              onChange={(e) => setKeysInput(prev => ({ ...prev, openai: e.target.value }))}
            />
          </div>

          <div className="ca-key-field">
            <label className="ca-key-label">
              <span>ElevenLabs Voice API Key (Optional)</span>
              <a 
                href="https://elevenlabs.io" 
                target="_blank" 
                rel="noreferrer" 
                className="ca-key-link"
              >
                <span>ElevenLabs Keys</span>
                <ExternalLink size={11} />
              </a>
            </label>
            <input 
              type="password"
              className="ca-key-input"
              placeholder={gatewayStatus?.elevenlabs?.configured ? "•••••••••••••••••••••••••••• (Saved)" : "xi-api-key..."}
              value={keysInput.elevenlabs}
              onChange={(e) => setKeysInput(prev => ({ ...prev, elevenlabs: e.target.value }))}
            />
          </div>

          {keyFeedback && (
            <div className={`ca-key-feedback ${keyFeedback.type}`}>
              {keyFeedback.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{keyFeedback.message}</span>
            </div>
          )}

          <div className="ca-key-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={savingKey}>
              {savingKey ? 'Testing & Saving...' : 'Save Keys to LMS Gateway'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
