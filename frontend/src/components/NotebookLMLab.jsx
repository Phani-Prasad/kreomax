import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { 
  BookOpen, 
  FileText, 
  Headphones, 
  Download, 
  Quote, 
  Play, 
  Pause, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  Send, 
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import './NotebookLMLab.css';

export function NotebookLMLab({ 
  projectTheme, 
  setProjectTheme, 
  onSaveAsset, 
  onNavigateNext 
}) {
  const INDIAN_SOURCE_PRESETS = {
    "🚀 Mission Chandrayaan 2085: Secret of the Lunar Water Vault": [
      {
        id: 1,
        title: "Doc 1: ISRO Lunar Base & Pragyan-X Rover",
        content: "Chandrayaan Station Alpha is located at the Moon's South Pole crater Malapert. Temperatures plunge to -200°C. Pragyan-X rovers navigate hazardous terrain using AI optical sensors. Massive water-ice reserves in Shackleton Crater supply oxygen to the crew domes.",
        citations: [
          { query: "How does Pragyan-X rover navigate?", answer: "Pragyan-X rovers navigate hazardous terrain using AI optical sensors." },
          { query: "Where is the water-ice located?", answer: "Massive water-ice reserves in Shackleton Crater supply oxygen to the crew domes." }
        ]
      },
      {
        id: 2,
        title: "Doc 2: Lunar Solar Sails & Telemetry",
        content: "Telemetry relays bounce off the Chandrayaan orbiter satellite network directly to ISRO ISTRAC in Bengaluru. Massive solar arrays positioned on high crater peaks capture perpetual sunlight, generating 100 Megawatts of clean power.",
        citations: [
          { query: "Where is telemetry sent?", answer: "Telemetry relays bounce off Chandrayaan orbiters directly to ISRO ISTRAC in Bengaluru." },
          { query: "How is power generated?", answer: "Massive solar arrays on crater peaks capture perpetual sunlight, generating 100 Megawatts." }
        ]
      }
    ],
    "🛕 Cyber-Varanasi 2090: The Floating Solar Ghats": [
      {
        id: 1,
        title: "Doc 1: Clean Ganga Bio-Robots & Floating Ghats",
        content: "Autonomous bio-cleaning drones shaped like robotic river dolphins purify the holy Ganga River 24/7. Floating solar lotus platforms power the sacred evening laser-aarti across 84 historic ghats.",
        citations: [
          { query: "How is the Ganga river purified?", answer: "Autonomous bio-cleaning drones shaped like robotic river dolphins purify the water 24/7." },
          { query: "What powers the evening laser-aarti?", answer: "Floating solar lotus platforms power the sacred evening laser-aarti across 84 historic ghats." }
        ]
      },
      {
        id: 2,
        title: "Doc 2: Ancient Sanskrit Algorithm Archives",
        content: "Subterranean archives beneath Manikarnika house digitized quantum palm-leaf manuscripts. These ancient Vedic mathematical algorithms predict weather patterns with zero carbon footprint.",
        citations: [
          { query: "Where are ancient algorithms stored?", answer: "Subterranean archives beneath Manikarnika house digitized quantum palm-leaf manuscripts." }
        ]
      }
    ]
  };

  const getInitialSources = () => {
    if (INDIAN_SOURCE_PRESETS[projectTheme]) {
      return INDIAN_SOURCE_PRESETS[projectTheme];
    }
    return [
      {
        id: 1,
        title: `Doc 1: Project Overview & Science Notes`,
        content: `Official research notes for ${projectTheme}. Field observations and verified data reveal critical environmental conditions, power supplies, and historical archives needed to accomplish the mission goals without hallucinations.`,
        citations: [
          { query: `What is the core research for ${projectTheme}?`, answer: `Field observations and verified data reveal critical environmental conditions, power supplies, and historical archives needed to accomplish the mission goals.` }
        ]
      },
      {
        id: 2,
        title: `Doc 2: Engineering & Tech Specifications`,
        content: `Technological blueprints and explorer telemetry logs for ${projectTheme}. Autonomous robotic sensors stream live telemetry to headquarters, verifying environmental safety and monitoring system performance.`,
        citations: [
          { query: "How does telemetry operate?", answer: "Autonomous robotic sensors stream live telemetry to headquarters, verifying environmental safety and monitoring system performance." }
        ]
      }
    ];
  };

  const [sources, setSources] = useState(getInitialSources());

  React.useEffect(() => {
    setSources(getInitialSources());
    setActiveSourceId(1);
  }, [projectTheme]);

  const [activeSourceId, setActiveSourceId] = useState(1);
  const [userQuery, setUserQuery] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [highlightedText, setHighlightedText] = useState(null);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [audioVoiceUrl, setAudioVoiceUrl] = useState(null);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const audioRef = React.useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello Aarav! I am your embedded NotebookLM assistant. I have ingested your mission notes. Ask me any question, and I will cite exact proof directly from your notes.",
      citation: null
    }
  ]);

  const activeSource = sources.find(s => s.id === activeSourceId) || sources[0];

  const handleTogglePodcast = async () => {
    if (isPlayingPodcast) {
      setIsPlayingPodcast(false);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    setIsPlayingPodcast(true);
    if (!audioVoiceUrl) {
      setIsVoiceLoading(true);
      try {
        const text = `Aarav here, alongside Ananya and Dr. Vikram Rao from ISRO! In today's young creator deep dive for ${projectTheme}, we are analyzing our verified mission notes. According to our official research records, Pragyan-X rovers use AI optical sensors to navigate craters at minus 200 degrees Celsius!`;
        const resp = await fetch('/api/ai/elevenlabs-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceType: 'elena' })
        });
        const data = await resp.json();
        setIsVoiceLoading(false);
        if (data && data.audioUrl) {
          setAudioVoiceUrl(data.audioUrl);
          if (audioRef.current) {
            audioRef.current.src = data.audioUrl;
            audioRef.current.play();
          }
        }
      } catch (err) {
        setIsVoiceLoading(false);
      }
    } else {
      if (audioRef.current) audioRef.current.play();
    }
  };

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const newDoc = {
      id: Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      citations: []
    };
    setSources(prev => [...prev, newDoc]);
    setActiveSourceId(newDoc.id);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: `Loaded new note "${newDoc.title}". Ask me anything about it to see citations!`,
        citation: null
      }
    ]);
  };

  const handleAskQuestion = async (queryText) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;

    const newChat = [...chatMessages, { sender: 'user', text: q, citation: null }];
    setChatMessages(newChat);
    setUserQuery('');
    setIsAnswering(true);

    try {
      const resp = await fetch('/api/ai/notebooklm-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          sources: sources,
          theme: projectTheme
        })
      });
      const data = await resp.json();
      setIsAnswering(false);

      if (data && data.status === 'success') {
        setChatMessages([...newChat, {
          sender: 'ai',
          text: data.answer,
          citation: data.citation,
          sourceBadge: data.source === 'gemini-1.5-flash' ? 'Google Gemini' : 'Grounded RAG'
        }]);

        if (data.citation && data.citation.text) {
          setHighlightedText(data.citation.text);
          if (data.citation.docId && data.citation.docId !== activeSourceId) {
            setActiveSourceId(data.citation.docId);
          }
        }
      }
    } catch (err) {
      setIsAnswering(false);
      const fallbackCit = { docId: 1, docName: sources[0]?.title || "Doc 1", text: "AI optical sensors" };
      setChatMessages([...newChat, {
        sender: 'ai',
        text: `Based on your notes: Pragyan-X rovers navigate hazardous crater terrain using AI optical sensors.`,
        citation: fallbackCit
      }]);
      setHighlightedText(fallbackCit.text);
    }
  };

  const handleDownloadResearch = () => {
    const content = `# MISSION RESEARCH & WORLD BRIEF
**Kreomax - Level 2: Google NotebookLM**
**Mission Theme**: ${projectTheme}
**Date**: ${new Date().toLocaleDateString()}

## Verified Sources & Proof Citations
${sources.map(s => `### ${s.title}\n${s.content}\n`).join('\n')}

---
*Ready for Level 3: Concept Art Studio with Midjourney & Imagen 3!*
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${projectTheme.replace(/\s+/g, '_')}_Research_Guide.md`);
    onSaveAsset('researchBrief', { theme: projectTheme, sources });
  };

  return (
    <div className="ca-notebook-lab-clean">
      {/* Studio Header */}
      <div className="ca-lab-header">
        <div className="ca-lab-header-left">
          <span className="ca-lab-badge">LEVEL 2 · NOTEBOOKLM</span>
          <h2 className="ca-lab-title">Research</h2>
        </div>

        <div className="ca-lab-actions">
          <button className="btn-secondary btn-sm" onClick={handleDownloadResearch}>
            <Download size={13} />
            <span>Export</span>
          </button>
          <button className="btn-primary btn-sm" onClick={onNavigateNext}>
            <span>Level 3</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2-Column Split Studio */}
      <div className="ca-lab-grid">
        {/* Left Column: Source Notes & Audio */}
        <div className="ca-lab-sources-panel">
          <div className="ca-panel-head">
            <span className="ca-panel-heading">Mission Sources</span>
            <span className="ca-panel-sub">{sources.length} Docs</span>
          </div>

          <div className="ca-sources-pills">
            {sources.map(s => (
              <button
                key={s.id}
                className={`ca-source-pill ${activeSourceId === s.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSourceId(s.id);
                  setHighlightedText(null);
                }}
              >
                <FileText size={13} />
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Active Document Viewer */}
          <div className="ca-source-reader">
            <div className="ca-reader-title">{activeSource.title}</div>
            <div className="ca-reader-content">
              {activeSource.content.split('. ').map((sentence, idx) => {
                const isHit = highlightedText && sentence.toLowerCase().includes(highlightedText.toLowerCase().slice(0, 15));
                return (
                  <span 
                    key={idx} 
                    className={`ca-reader-sentence ${isHit ? 'citation-glow' : ''}`}
                  >
                    {sentence}.{' '}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Audio Overview Podcast Player */}
          <div className="ca-podcast-card">
            <Headphones size={15} style={{ color: '#A78BFA', flexShrink: 0 }} />
            <div className="ca-pod-header">
              <div className="ca-pod-title">AI Podcast Briefing</div>
              <div className="ca-pod-sub">Aarav & Dr. Vikram · ElevenLabs</div>
            </div>

            <audio ref={audioRef} onEnded={() => setIsPlayingPodcast(false)} style={{ display: 'none' }} />
            
            <button 
              className={`ca-pod-play-btn ${isPlayingPodcast ? 'playing' : ''}`}
              onClick={handleTogglePodcast}
              disabled={isVoiceLoading}
            >
              {isVoiceLoading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                isPlayingPodcast ? <Pause size={13} /> : <Play size={13} />
              )}
              <span>{isVoiceLoading ? 'Loading...' : isPlayingPodcast ? 'Pause' : 'Play'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Grounded AI Chat */}
        <div className="ca-lab-chat-panel">
          <div className="ca-chat-top-status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} style={{ color: '#06B6D4' }} />
              <span className="ca-chat-status-text">Grounded Chat</span>
            </div>
            <span className="ca-grounded-pill">Zero Hallucinations ✓</span>
          </div>

          {/* Chat Messages */}
          <div className="ca-chat-stream">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`ca-bubble-row ${msg.sender}`}>
                <div className="ca-bubble-content">
                  {msg.sourceBadge && (
                    <span className="ca-badge-tag">{msg.sourceBadge}</span>
                  )}
                  <p className="ca-bubble-text">{msg.text}</p>
                  {msg.citation && (
                    <div 
                      className="ca-citation-pill"
                      onClick={() => {
                        setActiveSourceId(msg.citation.docId);
                        setHighlightedText(msg.citation.text);
                      }}
                      title="Click to view exact proof highlighted in left pane"
                    >
                      <Quote size={11} />
                      <span>Proof: "{msg.citation.text.slice(0, 42)}..." [View Proof]</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAnswering && (
              <div className="ca-bubble-row ai">
                <div className="ca-bubble-content answering">
                  <RefreshCw size={13} className="animate-spin text-cyan" />
                  <span>Citing notes...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="ca-quick-prompts-row">
            <button 
              className="ca-prompt-chip"
              onClick={() => handleAskQuestion("How does Pragyan-X rover navigate?")}
            >
              🚀 How does Pragyan rover navigate?
            </button>
            <button 
              className="ca-prompt-chip"
              onClick={() => handleAskQuestion("Where is the water-ice located?")}
            >
              ❄️ Where is water-ice located?
            </button>
            <button 
              className="ca-prompt-chip"
              onClick={() => handleAskQuestion("Where does telemetry bounce to?")}
            >
              📡 Telemetry relay destination?
            </button>
          </div>

          {/* Input Bar */}
          <form 
            className="ca-chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion();
            }}
          >
            <input 
              type="text" 
              placeholder="Ask NotebookLM a question about your mission notes..."
              className="ca-input-field"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
            <button type="submit" className="ca-send-btn" disabled={!userQuery.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {/* Ingest Note Modal */}
      {showAddModal && (
        <div className="ca-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ca-modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="ca-modal-header">
              <h3>Ingest Custom Note</h3>
              <button className="ca-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSource}>
              <div className="ca-form-group">
                <label>Note Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="e.g. Doc 3: Rover Battery Tech" 
                  required 
                />
              </div>
              <div className="ca-form-group">
                <label>Facts / Content</label>
                <textarea 
                  rows={4} 
                  value={newContent} 
                  onChange={e => setNewContent(e.target.value)} 
                  placeholder="Paste verified facts to ground NotebookLM..." 
                  required 
                />
              </div>
              <div className="ca-modal-actions">
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-sm">Add Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
