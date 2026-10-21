import React, { useState, useEffect } from 'react';
import { KreomaxIcon } from './KreomaxLogo';
import { 
  Sparkles, 
  BookOpen, 
  Cpu, 
  Image as ImageIcon, 
  Video, 
  Layout, 
  Award,
  GraduationCap,
  Compass,
  Smile,
  Zap,
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './Navbar.css';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  completedHours = [], 
  userProfile, 
  setUserProfile 
}) {
  const completedCount = completedHours.length;
  const progressPct = Math.round((completedCount / 24) * 100);

  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keysInput, setKeysInput] = useState({ gemini: '', openai: '', elevenlabs: '' });
  const [savingKey, setSavingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState(null);

  const fetchStatus = () => {
    fetch('/api/ai/gateway/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.tools) setGatewayStatus(data.tools);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatus();
  }, []);

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
        if (data.status && data.status.tools) {
          setGatewayStatus(data.status.tools);
        } else {
          fetchStatus();
        }
        setKeyFeedback({ type: 'success', message: data.message });
        setTimeout(() => {
          setShowKeyModal(false);
          setKeyFeedback(null);
        }, 1800);
      } else {
        setKeyFeedback({ type: 'error', message: data.error || 'Failed to save gateway keys' });
      }
    } catch (err) {
      setSavingKey(false);
      setKeyFeedback({ type: 'error', message: 'Network error communicating with LMS server.' });
    }
  };

  const toggleUserRole = () => {
    if (userProfile.role === 'Student Creator') {
      setUserProfile(prev => ({
        ...prev,
        role: 'Lead Mentor',
        name: 'Dr. Jane Vance',
        email: 'jane.vance@cognitive.academy'
      }));
    } else {
      setUserProfile(prev => ({
        ...prev,
        role: 'Student Creator',
        name: 'Alex Mercer',
        email: 'alex.mercer@cognitive.academy'
      }));
    }
  };

  return (
    <header className="ca-navbar">
      <div className="ca-nav-left">
        <div className="ca-logo" onClick={() => setActiveTab('roadmap')}>
          <div className="ca-logo-icon">
            <KreomaxIcon size={24} />
          </div>
          <div className="ca-logo-text">
            <span className="ca-brand-title">KREO<span className="ca-brand-accent">MAX</span></span>
            <span className="ca-brand-sub">CREATOR STUDIO</span>
          </div>
        </div>

        <nav className="ca-nav-links">
          <button 
            className={`ca-nav-btn ${activeTab === 'roadmap' || activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
            title="24-Hour Learning Journey Roadmap"
          >
            <Compass size={16} />
            <span>24h Journey</span>
          </button>

          <div className="ca-nav-separator" />

          <button 
            className={`ca-nav-btn ${activeTab === 'notebooklm' ? 'active' : ''}`}
            onClick={() => setActiveTab('notebooklm')}
            title="Level 1: AI Research Detective with NotebookLM"
          >
            <BookOpen size={16} className="text-blue" />
            <span>1. Research</span>
          </button>

          <button 
            className={`ca-nav-btn ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => setActiveTab('story')}
            title="Level 2: Story & Characters with ChatGPT & Gemini"
          >
            <Cpu size={16} className="text-emerald" />
            <span>2. Story</span>
          </button>

          <button 
            className={`ca-nav-btn ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
            title="Level 3: Digital Art Studio with Midjourney"
          >
            <ImageIcon size={16} className="text-purple" />
            <span>3. AI Art</span>
          </button>

          <button 
            className={`ca-nav-btn ${activeTab === 'motion' ? 'active' : ''}`}
            onClick={() => setActiveTab('motion')}
            title="Level 4: Movie Magic & Video with Google Veo"
          >
            <Video size={16} className="text-pink" />
            <span>4. Movie</span>
          </button>

          <button 
            className={`ca-nav-btn ${activeTab === 'web-builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('web-builder')}
            title="Level 5: Build Your Own Website"
          >
            <Layout size={16} className="text-amber" />
            <span>5. Website</span>
          </button>

          <button 
            className={`ca-nav-btn ca-nav-btn-highlight ${activeTab === 'capstone' ? 'active' : ''}`}
            onClick={() => setActiveTab('capstone')}
            title="Level 6: Final Project"
          >
            <Award size={16} className="text-cyan" />
            <span>6. Final Project</span>
          </button>
        </nav>
      </div>

      <div className="ca-nav-right">
        {/* Gemini Free AI Connection Pill */}
        {/* LMS Single Sign-On AI Multi-Tool Gateway Pill */}
        <button 
          className={`ca-gemini-pill ${gatewayStatus?.gemini?.configured || gatewayStatus?.chatgpt?.configured ? 'connected' : 'unconfigured'}`}
          onClick={() => setShowKeyModal(true)}
          title="LMS Single Sign-On AI Multi-Tool Gateway (ChatGPT, Gemini, NotebookLM, ElevenLabs)"
        >
          <Zap size={14} className={gatewayStatus?.gemini?.configured ? "text-emerald" : "text-amber"} />
          <div className="ca-gemini-pill-text">
            <span className="ca-gemini-lbl">Master AI Hub</span>
            <span className="ca-gemini-status">
              {gatewayStatus?.gemini?.configured ? "LMS Gateway (Active)" : "Connect AI Tools"}
            </span>
          </div>
        </button>

        {/* Progress Bar Badge */}
        <div className="ca-progress-pill" onClick={() => setActiveTab('roadmap')} title="View Learning Journey">
          <div className="ca-progress-info">
            <span className="ca-progress-label">Your Adventure</span>
            <span className="ca-progress-val">{completedCount}/24 Hrs ({progressPct}%)</span>
          </div>
          <div className="ca-progress-track">
            <div 
              className="ca-progress-fill" 
              style={{ width: `${progressPct}%` }} 
            />
          </div>
        </div>

        {/* SSO User Account Pill */}
        <div className="ca-user-pill" onClick={toggleUserRole} title="Click to toggle between Student and Mentor mode">
          <div className="ca-user-avatar-wrap">
            <img 
              src={userProfile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
              alt={userProfile?.name} 
              className="ca-user-avatar"
            />
            <span className="ca-role-dot" />
          </div>
          <div className="ca-user-details">
            <span className="ca-user-name">{userProfile?.name}</span>
            <span className="ca-user-role">
              <Smile size={11} /> {userProfile?.role}
            </span>
          </div>
        </div>
      </div>

      {/* LMS Master Multi-Tool Gateway Modal */}
      {showKeyModal && (
        <div className="ca-modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="ca-modal-content glass-panel" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="ca-modal-header">
              <div className="flex items-center gap-2">
                <Zap size={22} className="text-cyan" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>LMS Single Sign-On Multi-Tool Gateway</h3>
              </div>
              <button className="ca-close-btn" onClick={() => setShowKeyModal(false)}>✕</button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              One master login for all students! Enter your API keys once here—the LMS backend proxies requests securely so 12+ students never need individual accounts on OpenAI, Google, or ElevenLabs.
            </p>

            <form onSubmit={handleSaveKeys}>
              {/* Tool 1: Google Gemini & NotebookLM */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} className="text-blue" />
                    <strong style={{ fontSize: '0.88rem' }}>Google Gemini & NotebookLM Grounding</strong>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>FREE TIER</span>
                  </div>
                  {gatewayStatus?.gemini?.configured && (
                    <span style={{ color: '#34D399', fontSize: '0.74rem', fontFamily: 'monospace' }}>Active ({gatewayStatus.gemini.maskedKey})</span>
                  )}
                </div>
                <input 
                  type="password"
                  placeholder="Paste Google Gemini Key: AIzaSy..."
                  value={keysInput.gemini}
                  onChange={e => setKeysInput(prev => ({ ...prev, gemini: e.target.value }))}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '0.84rem' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Powers Level 1 (NotebookLM Citations) & Level 2 Screenplay. Free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#38BDF8', textDecoration: 'underline' }}>Google AI Studio ↗</a>
                </div>
              </div>

              {/* Tool 2: OpenAI / ChatGPT */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={16} className="text-emerald" />
                    <strong style={{ fontSize: '0.88rem' }}>OpenAI ChatGPT (GPT-4o)</strong>
                  </div>
                  {gatewayStatus?.chatgpt?.configured && (
                    <span style={{ color: '#34D399', fontSize: '0.74rem', fontFamily: 'monospace' }}>Active ({gatewayStatus.chatgpt.maskedKey})</span>
                  )}
                </div>
                <input 
                  type="password"
                  placeholder="Paste OpenAI Key: sk-..."
                  value={keysInput.openai}
                  onChange={e => setKeysInput(prev => ({ ...prev, openai: e.target.value }))}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '0.84rem' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Powers Level 2 (Story Studio Screenplay Engine). Found at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#38BDF8', textDecoration: 'underline' }}>OpenAI Platform ↗</a>
                </div>
              </div>

              {/* Tool 3: ElevenLabs Voice AI */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} className="text-purple" />
                    <strong style={{ fontSize: '0.88rem' }}>ElevenLabs Text-to-Speech</strong>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>FREE TIER</span>
                  </div>
                  {gatewayStatus?.elevenlabs?.configured && (
                    <span style={{ color: '#34D399', fontSize: '0.74rem', fontFamily: 'monospace' }}>Active ({gatewayStatus.elevenlabs.maskedKey})</span>
                  )}
                </div>
                <input 
                  type="password"
                  placeholder="Paste ElevenLabs Key: xi-..."
                  value={keysInput.elevenlabs}
                  onChange={e => setKeysInput(prev => ({ ...prev, elevenlabs: e.target.value }))}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '0.84rem' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Powers Audio Overview podcast voices (Elena & Marcus) and Level 4 Movie Trailer narrator. Free at <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noreferrer" style={{ color: '#38BDF8', textDecoration: 'underline' }}>ElevenLabs ↗</a>
                </div>
              </div>

              {keyFeedback && (
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: '8px', 
                  marginBottom: '16px', 
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: keyFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${keyFeedback.type === 'success' ? '#10B981' : '#EF4444'}`,
                  color: keyFeedback.type === 'success' ? '#34D399' : '#F87171'
                }}>
                  {keyFeedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{keyFeedback.message}</span>
                </div>
              )}

              <div className="ca-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowKeyModal(false)}>Close</button>
                <button type="submit" className="btn-primary" disabled={savingKey}>
                  {savingKey ? "Saving & Testing Gateway..." : "Save Master LMS Gateway Keys"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
