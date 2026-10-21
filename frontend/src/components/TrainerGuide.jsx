import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, MessageSquare, X, Send, Sparkles, CheckCircle2, 
  HelpCircle, ChevronRight, Award, Zap, Lightbulb, UserCheck
} from 'lucide-react';
import './TrainerGuide.css';

const TRAINER_TIPS = {
  m1: {
    levelNum: 1,
    title: "Level 1: Story Writing",
    mentorGoal: "Master prompt engineering by designing an unforgettable hero and directing a 4-scene script.",
    goldenRules: [
      "Role + Context + Task + Rules: Always use all 4 parts of the formula for sharp AI responses.",
      "Flawed Heroes are Better Heroes: Don't make your hero invulnerable. Give them an interesting quirk or flaw!",
      "Dialogue Rule: Keep lines under 20 words so they pack an emotional punch.",
      "16:9 Art Prompts: Specify lighting, camera distance, and art style for each scene."
    ],
    rubricItems: [
      "Hero profile created with Name, Superpower, and Flaw",
      "4-part ChatGPT prompt formula tested and refined",
      "4 complete scenes with sluglines and dialogue",
      "Visual art prompts ready for Level 3 concept art"
    ],
    quickPills: [
      "How do I give my hero a great flaw?",
      "Can you review my 4-part prompt formula?",
      "How to prevent ChatGPT from giving cliché endings?",
      "What is needed to earn Badge 1?"
    ]
  },
  m2: {
    levelNum: 2,
    title: "Level 2: Research",
    mentorGoal: "Ground your sci-fi story in factual science and verify sources with citation detective work.",
    goldenRules: [
      "Zero Hallucinations: Ground your research strictly in verified mission documents.",
      "Look for Citations: Always click [1] and [2] chips to check source paragraphs.",
      "Turn Fact into Drama: Use extreme temperatures or orbital decay as thrilling plot stakes.",
      "Audio Overview: Generate an audio briefing to listen to your mission like a podcast."
    ],
    rubricItems: [
      "At least 2 verified source notes ingested",
      "Source citation queries tested without hallucination",
      "Scientific facts linked directly to story scene stakes",
      "Research brief downloaded for Capstone vault"
    ],
    quickPills: [
      "How do NotebookLM citations prevent hallucinations?",
      "How can I turn a scientific fact into a story conflict?",
      "How do I ingest custom mission notes?",
      "What is needed to earn Badge 2?"
    ]
  },
  m3: {
    levelNum: 3,
    title: "Level 3: Images & Art",
    mentorGoal: "Translate script descriptions into consistent 16:9 concept art with cinematic lighting.",
    goldenRules: [
      "Lighting & Mood: Use volumetric lighting, golden hour, or bioluminescent neon.",
      "Aspect Ratio: Always include --ar 16:9 for widescreen cinematic movie framing.",
      "Character Consistency: Repeat your hero's signature gadget and suit description in every prompt."
    ],
    rubricItems: [
      "4 distinct scene concept art stills generated",
      "Hero visual identity consistent across all stills",
      "Widescreen 16:9 aspect ratio applied"
    ],
    quickPills: [
      "How do I keep my hero looking the same in all 4 pictures?",
      "Best lighting keywords for sci-fi scenes?",
      "What does --ar 16:9 do?"
    ]
  },
  m4: {
    levelNum: 4,
    title: "Level 4: Video & Animation",
    mentorGoal: "Bring still pictures to life with dynamic camera moves and dramatic audio cues.",
    goldenRules: [
      "Camera Intent: Choose Drone Pan for landscapes, Slow Zoom for tension, Orbit for action.",
      "Pacing: Keep individual shots between 4 to 8 seconds for maximum viewer retention.",
      "Sound Design: Pair sitar-synth melodies with punchy sound effects and hero voiceover."
    ],
    rubricItems: [
      "4 scenes animated with deliberate camera moves",
      "Trailer timeline reviewed with sound sync",
      "Trailer package exported for showcase website"
    ],
    quickPills: [
      "When should I use Drone Pan vs Slow Zoom?",
      "How do I sync voiceover with video clips?",
      "Exporting trailer video assets"
    ]
  },
  m5: {
    levelNum: 5,
    title: "Level 5: Website Builder",
    mentorGoal: "Assemble your story, trailer, and art into a responsive modern website.",
    goldenRules: [
      "Clear Hierarchy: Put the hero trailer at the top with a strong headline.",
      "Mobile Friendly: Always test how your website looks on phone and tablet views.",
      "Inspect Real Code: Understand the difference between HTML tags, CSS styles, and JS logic."
    ],
    rubricItems: [
      "Website customized with title, theme, and colors",
      "All 4 story scenes and trailer video integrated",
      "Tested on laptop and mobile screen modes",
      "Website ZIP package downloaded"
    ],
    quickPills: [
      "How does CSS make websites look modern?",
      "Testing my site on mobile phone screens",
      "How do I host or open the downloaded HTML file?"
    ]
  },
  m6: {
    levelNum: 6,
    title: "Level 6: Final Project",
    mentorGoal: "Complete the 4-pillar mentor evaluation (100/100 points) and claim your certified credential.",
    goldenRules: [
      "Pillar 1 Research: 25 points for grounded citations and facts.",
      "Pillar 2 Scriptwriting: 25 points for original hero and 4-scene narrative.",
      "Pillar 3 Art & Video: 25 points for visual consistency and trailer pacing.",
      "Pillar 4 Web Engineering: 25 points for responsive interactive design."
    ],
    rubricItems: [
      "All 5 level deliverables verified ready in vault",
      "4-pillar mentor review completed with 100/100 points",
      "Personalized Certificate of Completion downloaded"
    ],
    quickPills: [
      "What is the capstone grading rubric?",
      "How do I export my master bundle ZIP?",
      "How do I claim my graduation certificate?"
    ]
  }
};

export function TrainerGuide({
  isOpen,
  onClose,
  activeTab,
  projectTheme,
  userProfile
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'trainer',
      text: "Namaste! I am Dr. Vikram Rao, your assigned AI & Space Innovation Mentor. Whenever you need guidance on prompt formulas, hero storytelling, or level rubrics, just ask me here!",
      time: "Just now"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeGuideView, setActiveGuideView] = useState('advice'); // 'advice' | 'rubric' | 'chat'
  const chatEndRef = useRef(null);

  // Map activeTab to module key
  const activeModKey = (() => {
    switch (activeTab) {
      case 'story': return 'm1';
      case 'notebooklm': return 'm2';
      case 'visual': return 'm3';
      case 'motion': return 'm4';
      case 'web-builder': return 'm5';
      case 'capstone': return 'm6';
      default: return 'm1';
    }
  })();

  const tipData = TRAINER_TIPS[activeModKey] || TRAINER_TIPS.m1;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      sender: 'student',
      text: query.trim(),
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/trainer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          currentLevel: tipData.levelNum,
          projectTheme: projectTheme
        })
      });
      const data = await res.json();
      if (data && data.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'trainer',
            text: data.reply,
            time: 'Just now'
          }
        ]);
      } else {
        throw new Error("No response");
      }
    } catch {
      // Smart offline mentor reply
      setMessages(prev => [
        ...prev,
        {
          sender: 'trainer',
          text: `Great question! In Level ${tipData.levelNum}, remember: AI works best when given very clear constraints. Make sure you define your hero's goal, location, and the emotional mood of each scene!`,
          time: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ca-trainer-modal-overlay" onClick={onClose}>
      <div className="ca-trainer-drawer glass-panel" onClick={e => e.stopPropagation()}>
        {/* Trainer Header */}
        <div className="ca-trainer-header">
          <div className="ca-trainer-profile">
            <div className="ca-trainer-avatar-wrap">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                alt="Dr. Vikram Rao" 
                className="ca-trainer-avatar"
              />
              <span className="ca-trainer-status-dot" title="Trainer Online" />
            </div>
            <div className="ca-trainer-meta">
              <div className="ca-trainer-name-row">
                <h3>Dr. Vikram Rao</h3>
                <span className="ca-trainer-badge">Assigned LMS Mentor</span>
              </div>
              <p className="ca-trainer-sub">ISRO Senior Scientist & Master AI Educator</p>
            </div>
          </div>
          <button className="ca-trainer-close-btn" onClick={onClose} aria-label="Close mentor panel">
            <X size={18} />
          </button>
        </div>

        {/* Level Indicator Strip */}
        <div className="ca-trainer-level-strip">
          <div className="ca-trainer-level-tag">
            <GraduationCap size={14} className="text-cyan" />
            <span>{tipData.title}</span>
          </div>
          <span className="ca-trainer-mission-pill">{projectTheme.split(':')[0]}</span>
        </div>

        {/* View Switcher Tabs */}
        <div className="ca-trainer-nav-tabs">
          <button 
            className={`ca-trainer-nav-tab ${activeGuideView === 'advice' ? 'active' : ''}`}
            onClick={() => setActiveGuideView('advice')}
          >
            <Lightbulb size={14} />
            <span>Mentor Guidance</span>
          </button>
          <button 
            className={`ca-trainer-nav-tab ${activeGuideView === 'rubric' ? 'active' : ''}`}
            onClick={() => setActiveGuideView('rubric')}
          >
            <Award size={14} />
            <span>Badge Rubric</span>
          </button>
          <button 
            className={`ca-trainer-nav-tab ${activeGuideView === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveGuideView('chat')}
          >
            <MessageSquare size={14} />
            <span>Ask Trainer ({messages.length})</span>
          </button>
        </div>

        {/* View 1: Mentor Advice */}
        {activeGuideView === 'advice' && (
          <div className="ca-trainer-content-body">
            <div className="ca-trainer-card goal-card">
              <div className="ca-trainer-card-header">
                <Sparkles size={16} className="text-cyan" />
                <h4>Trainer's Mission Objective</h4>
              </div>
              <p className="ca-trainer-goal-text">{tipData.mentorGoal}</p>
            </div>

            <div className="ca-trainer-card">
              <div className="ca-trainer-card-header">
                <Zap size={16} className="text-amber" />
                <h4>Dr. Vikram's Golden Rules for this Level</h4>
              </div>
              <div className="ca-trainer-rules-list">
                {tipData.goldenRules.map((rule, idx) => (
                  <div key={idx} className="ca-trainer-rule-item">
                    <span className="ca-rule-num">0{idx + 1}</span>
                    <span className="ca-rule-text">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ca-trainer-card">
              <div className="ca-trainer-card-header">
                <HelpCircle size={16} className="text-emerald" />
                <h4>Quick Mentor Questions</h4>
              </div>
              <div className="ca-trainer-pills-wrap">
                {tipData.quickPills.map((pill, idx) => (
                  <button 
                    key={idx} 
                    className="ca-trainer-ask-pill"
                    onClick={() => {
                      setActiveGuideView('chat');
                      handleSendMessage(pill);
                    }}
                  >
                    <span>{pill}</span>
                    <ChevronRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View 2: Rubric Checklist */}
        {activeGuideView === 'rubric' && (
          <div className="ca-trainer-content-body">
            <div className="ca-trainer-card">
              <div className="ca-trainer-card-header">
                <Award size={16} className="text-cyan" />
                <h4>Level {tipData.levelNum} Badge Requirements</h4>
              </div>
              <p className="ca-trainer-sub-note">
                Complete these 4 requirements to earn Badge #{tipData.levelNum} and advance toward your Capstone Certificate:
              </p>
              <div className="ca-trainer-rubric-list">
                {tipData.rubricItems.map((item, idx) => (
                  <div key={idx} className="ca-trainer-rubric-item">
                    <CheckCircle2 size={16} className="text-emerald" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ca-trainer-encouragement glass-panel">
              <UserCheck size={20} className="text-emerald" />
              <div>
                <strong>Student: {userProfile?.name}</strong>
                <p>Your mentor reviews every completed level. Build with pride and curiosity!</p>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Interactive Ask Trainer Chat */}
        {activeGuideView === 'chat' && (
          <div className="ca-trainer-chat-container">
            <div className="ca-trainer-messages-list">
              {messages.map((msg, idx) => (
                <div key={idx} className={`ca-trainer-msg-bubble ${msg.sender}`}>
                  <div className="ca-msg-sender-label">
                    {msg.sender === 'trainer' ? '🎓 Dr. Vikram Rao' : `👤 ${userProfile?.name || 'You'}`}
                  </div>
                  <div className="ca-msg-text">{msg.text}</div>
                </div>
              ))}
              {isLoading && (
                <div className="ca-trainer-msg-bubble trainer loading">
                  <div className="ca-msg-sender-label">🎓 Dr. Vikram Rao</div>
                  <div className="ca-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Pills above input */}
            <div className="ca-chat-quick-bar">
              {tipData.quickPills.slice(0, 2).map((pill, idx) => (
                <button 
                  key={idx} 
                  className="ca-chat-quick-chip"
                  onClick={() => handleSendMessage(pill)}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form 
              className="ca-trainer-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input 
                type="text"
                placeholder="Ask Dr. Vikram Rao for prompt advice or script tips..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" disabled={!inputText.trim() || isLoading} className="ca-trainer-send-btn">
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
