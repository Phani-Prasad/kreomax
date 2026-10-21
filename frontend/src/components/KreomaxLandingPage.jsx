import React, { useState, useEffect } from 'react';
import { KreomaxIcon } from './KreomaxLogo';
import { PaymentModal } from './PaymentModal';
import {
  BookOpen,
  Cpu,
  Image as ImageIcon,
  Video,
  Layout,
  Award,
  ArrowRight,
  Sparkles,
  Play,
  ChevronRight,
  ChevronLeft,
  Zap,
  Star,
  Menu,
  X,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone
} from 'lucide-react';
import './KreomaxLandingPage.css';

/* Studio Cards (teaser only) */
const STUDIOS = [
  {
    id: 'story',
    level: 1,
    name: 'Story Studio',
    tagline: 'Write your cinematic screenplay',
    engine: 'ChatGPT',
    icon: BookOpen,
    color: '#059669',
    glow: 'rgba(5,150,105,0.35)',
    output: 'Screenplay Script',
    preview: 'SCENE 1: SHACKLETON CRATER - NIGHT\nThe drill strikes crystalline ice.\nSensors pulse: Mission Control,\nviable water resonance confirmed.'
  },
  {
    id: 'notebooklm',
    level: 2,
    name: 'Research Lab',
    tagline: 'Verify facts with AI citations',
    engine: 'NotebookLM',
    icon: Cpu,
    color: '#4F46E5',
    glow: 'rgba(79,70,229,0.35)',
    output: 'Research Guide',
    preview: 'Verified Fact · Source: NASA LRO 2024\n"Moon\'s south pole holds ~600M tons\nof water ice for rocket propellant."'
  },
  {
    id: 'visual',
    level: 3,
    name: 'Visual Studio',
    tagline: 'Generate cinematic concept art',
    engine: 'Midjourney',
    icon: ImageIcon,
    color: '#7C3AED',
    glow: 'rgba(124,58,237,0.35)',
    output: 'Concept Art Pack',
    preview: 'Cinematic 16:9 · Astronaut on Shackleton Rim\nStyle: Unreal Engine 5\nAnamorphic lens flare · 8K render'
  },
  {
    id: 'motion',
    level: 4,
    name: 'Motion Studio',
    tagline: 'Animate scenes into trailers',
    engine: 'Google Veo',
    icon: Video,
    color: '#DB2777',
    glow: 'rgba(219,39,119,0.35)',
    output: '32-sec Movie Trailer',
    preview: 'Scene 1: Slow crane zoom\nScene 2: Drone pan above crater\nScene 3: Visor closeup\nScore + voiceover synced'
  },
  {
    id: 'web-builder',
    level: 5,
    name: 'Web Builder',
    tagline: 'Launch your showcase website',
    engine: 'Web Studio',
    icon: Layout,
    color: '#D97706',
    glow: 'rgba(217,119,6,0.35)',
    output: 'Live Portfolio Site',
    preview: '<hero> Mission Chandrayaan 2035\n<gallery> 4 concept art images\n<video> 32-sec trailer embed\n<footer> Creator credential'
  },
  {
    id: 'capstone',
    level: 6,
    name: 'Capstone Vault',
    tagline: 'Earn your creator certificate',
    engine: 'Project Showcase',
    icon: Award,
    color: '#0284C7',
    glow: 'rgba(2,132,199,0.35)',
    output: 'Portfolio + Certificate',
    preview: 'Story · Research · Art\nTrailer · Website bundled\n100-point rubric evaluation\nATL Certified · Score: 98/100'
  }
];

/* Student Showcase Projects */
const STUDENT_PROJECTS = [
  {
    title: 'Chandrayaan Space Odyssey',
    student: 'Grade 8 · Space Sciences Track',
    cohort: 'ATL Innovation Cohort',
    coverImg: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80',
    score: '98/100',
    color: '#4F46E5',
    tags: ['Screenplay', 'Research', 'Concept Art', 'Trailer', 'Website']
  },
  {
    title: 'Cyber Mecha Titans 2050',
    student: 'Grade 9 · AI & Robotics Track',
    cohort: 'Mechatronics Cohort',
    coverImg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    score: '100/100',
    color: '#7C3AED',
    tags: ['Mecha Script', 'Exo-Science', '4K Mecha Art', 'Arena Reel', 'Web Hub']
  },
  {
    title: 'Sky Dragon Chronicles',
    student: 'Grade 8 · Digital Animation Track',
    cohort: 'Fantasy & CGI Cohort',
    coverImg: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    score: '97/100',
    color: '#059669',
    tags: ['Dragon Script', 'Aerodynamics', 'Ghibli Art', 'Flight Reel', 'Showcase']
  }
];

/* Output Pipeline Steps */
const PIPELINE = [
  { icon: BookOpen, label: 'Screenplay', sub: 'Your story, your world', color: '#10B981', bg: 'rgba(16,185,129,0.14)' },
  { icon: Cpu, label: 'Research', sub: 'Fact-verified ideas', color: '#6366F1', bg: 'rgba(99,102,241,0.14)' },
  { icon: ImageIcon, label: 'Concept Art', sub: 'Cinematic visuals', color: '#8B5CF6', bg: 'rgba(139,92,246,0.14)' },
  { icon: Video, label: 'Video Reel', sub: '32-sec movie trailer', color: '#EC4899', bg: 'rgba(236,72,153,0.14)' },
  { icon: Layout, label: 'Website', sub: 'Live portfolio', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' },
  { icon: Award, label: 'Certificate', sub: 'Verified credential', color: '#38BDF8', bg: 'rgba(56,189,248,0.14)' }
];

/* Hero Slides with Motions */
const HERO_SLIDES = [
  {
    src: '/hero1.jpg',
    badge: 'Building & Coding',
    caption: 'Teen innovators coding and building real AI projects'
  },
  {
    src: '/hero2.jpg',
    badge: 'Storyboards & Concept Art',
    caption: 'Creating cinematic concept art & character designs'
  },
  {
    src: '/hero3.jpg',
    badge: 'Presenting Live',
    caption: 'Showcasing interactive AI worlds to classmates'
  },
  {
    src: '/hero4.jpg',
    badge: 'Directing & Filming',
    caption: 'Directing movie trailers and capturing cinematic scenes'
  }
];

export function KreomaxLandingPage({ onLaunchStudio, onOpenKeyModal }) {
  const [activeStudio, setActiveStudio] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setHeroSlide(s => (s + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  const nextSlide = () => setHeroSlide((heroSlide + 1) % HERO_SLIDES.length);
  const prevSlide = () => setHeroSlide((heroSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const activeS = STUDIOS[activeStudio];
  const currentSlide = HERO_SLIDES[heroSlide];

  return (
    <div className="klp-root">

      {/* NAVBAR */}
      <nav className="klp-nav">
        <div className="klp-nav-inner">
          <div className="klp-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <KreomaxIcon size={34} />
            <div className="klp-nav-brand-text">
              <span className="klp-nav-title">
                KREO<span className="klp-nav-title-accent">MAX</span>
              </span>
              <span className="klp-nav-subtitle">CREATOR STUDIO</span>
            </div>
          </div>

          <div className="klp-nav-links">
            <button className="klp-nav-link" onClick={() => document.getElementById('klp-studios')?.scrollIntoView({ behavior: 'smooth' })}>Studios</button>
            <button className="klp-nav-link" onClick={() => document.getElementById('klp-showcase')?.scrollIntoView({ behavior: 'smooth' })}>Student Work</button>
            <button className="klp-nav-link klp-nav-link--pricing" onClick={() => setShowPaymentModal(true)}>
              <CreditCard size={13} /> Cohorts & Pricing
            </button>
            <button className="klp-cta-btn klp-cta-btn--sm" onClick={() => setShowPaymentModal(true)}>
              Launch Studio <ArrowRight size={14} />
            </button>
          </div>

          <button className="klp-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(v => !v)}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="klp-mobile-menu">
            <button className="klp-mobile-link" onClick={() => { document.getElementById('klp-studios')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Studios</button>
            <button className="klp-mobile-link" onClick={() => { document.getElementById('klp-showcase')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Student Work</button>
            <button className="klp-mobile-link" onClick={() => { setShowPaymentModal(true); setIsMobileMenuOpen(false); }}>Cohorts & Pricing</button>
            <button className="klp-cta-btn klp-cta-btn--full" onClick={() => { setShowPaymentModal(true); setIsMobileMenuOpen(false); }}>Launch Studio</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className={`klp-hero ${heroVisible ? 'klp-hero--visible' : ''}`}>
        <div className="klp-hero-bg-glow klp-hero-bg-glow--1" />
        <div className="klp-hero-bg-glow klp-hero-bg-glow--2" />
        <div className="klp-hero-bg-glow klp-hero-bg-glow--3" />

        <div className="klp-hero-inner">
          <div className="klp-hero-text">
            <div className="klp-hero-badge">
              <Sparkles size={13} />
              <span>AI Creator Studio · 24 Hours · 6 Levels</span>
            </div>

            <h1 className="klp-hero-headline">
              Stop Just Scrolling.<br />
              <span className="klp-gradient-text">Start Cooking.</span>
            </h1>

            <p className="klp-hero-sub">
              Turn your ideas into real screenplays, cinematic concept art,
              movie trailers, and live showcase websites - guided step-by-step
              with 6 Levels in 24 hours.
            </p>

            <div className="klp-hero-actions">
              <button className="klp-cta-btn klp-cta-btn--primary" onClick={() => setShowPaymentModal(true)}>
                <Play size={16} fill="currentColor" />
                Start Building Now
              </button>
              <button className="klp-cta-btn klp-cta-btn--ghost" onClick={() => document.getElementById('klp-studios')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Studios <ChevronRight size={16} />
              </button>
            </div>

            <div className="klp-hero-stats">
              <div className="klp-stat">
                <span className="klp-stat-num">6</span>
                <span className="klp-stat-label">AI Studios</span>
              </div>
              <div className="klp-stat-divider" />
              <div className="klp-stat">
                <span className="klp-stat-num">24</span>
                <span className="klp-stat-label">Guided Hours</span>
              </div>
              <div className="klp-stat-divider" />
              <div className="klp-stat">
                <span className="klp-stat-num">5+</span>
                <span className="klp-stat-label">Real Deliverables</span>
              </div>
            </div>
          </div>

          <div className="klp-hero-visual">
            <div className="klp-hero-img-frame">
              {/* Motion Slideshow */}
              {HERO_SLIDES.map((slide, i) => (
                <div
                  key={slide.src}
                  className={`klp-hero-img-slide ${i === heroSlide ? 'klp-hero-img-slide--active' : ''}`}
                >
                  <img
                    src={slide.src}
                    alt={slide.caption}
                    className="klp-hero-img"
                  />
                </div>
              ))}

              <div className="klp-hero-img-overlay" />

              {/* Slide Caption Banner */}
              <div className="klp-hero-caption-card">
                <span className="klp-hero-caption-tag">{currentSlide.badge}</span>
                <span className="klp-hero-caption-text">{currentSlide.caption}</span>
              </div>

              {/* Prev / Next controls */}
              <button className="klp-slide-nav klp-slide-nav--prev" onClick={prevSlide} aria-label="Previous slide">
                <ChevronLeft size={16} />
              </button>
              <button className="klp-slide-nav klp-slide-nav--next" onClick={nextSlide} aria-label="Next slide">
                <ChevronRight size={16} />
              </button>

              {/* Slide dots */}
              <div className="klp-slide-dots">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className={`klp-slide-dot ${i === heroSlide ? 'klp-slide-dot--active' : ''}`}
                    onClick={() => setHeroSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Floating output pills */}
              <div className="klp-float-pill klp-float-pill--1">
                <BookOpen size={14} color="#34d399" /> Screenplay written
              </div>
              <div className="klp-float-pill klp-float-pill--2">
                <ImageIcon size={14} color="#a78bfa" /> Concept art generated
              </div>
              <div className="klp-float-pill klp-float-pill--3">
                <Award size={14} color="#38bdf8" /> 98/100 certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDIOS SECTION */}
      <section className="klp-section klp-studios-section" id="klp-studios">
        <div className="klp-section-inner">
          <div className="klp-section-header">
            <div className="klp-section-eyebrow">
              <Sparkles size={13} /> What's Inside
            </div>
            <h2 className="klp-section-title">
              One Platform. 6 Levels of Creation.
            </h2>
            <p className="klp-section-sub">
              Expert-Led Learning. Hands-On Creation. Real-World Results.
            </p>
          </div>

          <div className="klp-studios-layout">
            {/* Left: Studio Tab List */}
            <div className="klp-studio-tabs">
              {STUDIOS.map((studio, i) => {
                const Icon = studio.icon;
                const isActive = activeStudio === i;
                return (
                  <button
                    key={studio.id}
                    className={`klp-studio-tab ${isActive ? 'klp-studio-tab--active' : ''}`}
                    style={{ '--studio-color': studio.color, '--studio-glow': studio.glow }}
                    onClick={() => setActiveStudio(i)}
                  >
                    <div className="klp-studio-tab-num">Level {studio.level}</div>
                    <div className="klp-studio-tab-icon">
                      <Icon size={18} />
                    </div>
                    <div className="klp-studio-tab-info">
                      <div className="klp-studio-tab-name">{studio.name}</div>
                      <div className="klp-studio-tab-tagline">{studio.tagline}</div>
                    </div>
                    <ChevronRight size={14} className="klp-studio-tab-arrow" />
                  </button>
                );
              })}
            </div>

            {/* Right: Active Studio Preview Panel */}
            <div
              className="klp-studio-preview"
              style={{ '--studio-color': activeS.color, '--studio-glow': activeS.glow }}
              key={activeS.id}
            >
              <div className="klp-studio-preview-header">
                <div className="klp-studio-preview-badge">
                  Level {activeS.level} · {activeS.engine}
                </div>
                <div className="klp-studio-preview-title">
                  <span className="klp-studio-preview-icon-wrap" style={{ color: activeS.color }}>
                    <activeS.icon size={22} />
                  </span>
                  {activeS.name}
                </div>
                <div className="klp-studio-preview-tagline">{activeS.tagline}</div>
              </div>

              <div className="klp-studio-preview-screen">
                <div className="klp-screen-dots">
                  <span /><span /><span />
                </div>
                <div className="klp-screen-title">{activeS.engine} · {activeS.name}</div>
                <pre className="klp-screen-content">{activeS.preview}</pre>
              </div>

              <div className="klp-studio-preview-output">
                <div className="klp-output-label">Your deliverable:</div>
                <div className="klp-output-pill">
                  <Star size={12} fill="currentColor" />
                  {activeS.output}
                </div>
              </div>

              <button
                className="klp-studio-launch-btn"
                onClick={() => setShowPaymentModal(true)}
              >
                Open {activeS.name} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* OUTPUT PIPELINE */}
      <section className="klp-section klp-pipeline-section">
        <div className="klp-section-inner">
          <div className="klp-section-header">
            <div className="klp-section-eyebrow">
              <Zap size={13} /> What You'll Build
            </div>
            <h2 className="klp-section-title">
              From Idea to Portfolio in 24 Hours
            </h2>
          </div>

          <div className="klp-pipeline">
            {PIPELINE.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <React.Fragment key={i}>
                  <div className="klp-pipeline-step">
                    <div
                      className="klp-pipeline-icon-box"
                      style={{ color: step.color, background: step.bg }}
                    >
                      <StepIcon size={24} />
                    </div>
                    <div className="klp-pipeline-label">{step.label}</div>
                    <div className="klp-pipeline-sub">{step.sub}</div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="klp-pipeline-arrow">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* STUDENT SHOWCASE */}
      <section className="klp-section klp-showcase-section" id="klp-showcase">
        <div className="klp-section-inner">
          <div className="klp-section-header">
            <div className="klp-section-eyebrow">
              <Star size={13} /> Student Work
            </div>
            <h2 className="klp-section-title">
              Built by Students, Just Like You
            </h2>
            <p className="klp-section-sub">
              Discover inspiring student projects that transform creative ideas into real-world innovations with Kreomax.
            </p>
          </div>

          <div className="klp-showcase-grid">
            {STUDENT_PROJECTS.map((proj, i) => (
              <div
                key={i}
                className="klp-showcase-card"
                style={{ '--proj-color': proj.color }}
              >
                <div className="klp-showcase-img-wrap">
                  <img
                    src={proj.coverImg}
                    alt={proj.title}
                    className="klp-showcase-img"
                  />
                  <div className="klp-showcase-img-overlay" />
                  <div className="klp-showcase-score">{proj.score}</div>
                </div>
                <div className="klp-showcase-body">
                  <div className="klp-showcase-cohort">{proj.cohort}</div>
                  <div className="klp-showcase-title">{proj.title}</div>
                  <div className="klp-showcase-student">{proj.student}</div>
                  <div className="klp-showcase-tags">
                    {proj.tags.map((tag, ti) => (
                      <span key={ti} className="klp-showcase-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BAND */}
      <section className="klp-cta-section">
        <div className="klp-cta-glow klp-cta-glow--1" />
        <div className="klp-cta-glow klp-cta-glow--2" />
        <div className="klp-cta-inner">
          <div className="klp-hero-badge" style={{ margin: '0 auto 1.5rem' }}>
            <Sparkles size={13} /> Start Today - No Experience Needed
          </div>
          <h2 className="klp-cta-title">
            Your Cinematic Universe<br />
            <span className="klp-gradient-text">Starts Right Now</span>
          </h2>
          <p className="klp-cta-sub">
            24 guided hours · 6 creative studios · 5 real deliverables · 1 certified portfolio
          </p>
          <div className="klp-cta-actions">
            <button className="klp-cta-btn klp-cta-btn--primary klp-cta-btn--lg" onClick={() => setShowPaymentModal(true)}>
              <Play size={18} fill="currentColor" />
              Launch Kreomax Studio
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="klp-footer">
        <div className="klp-footer-inner">
          <div className="klp-footer-grid">
            {/* Column 1: Brand & Veteran Credential */}
            <div className="klp-footer-col klp-footer-col--brand">
              <div className="klp-footer-brand">
                <KreomaxIcon size={32} />
                <div className="klp-footer-brand-text">
                  <span className="klp-footer-title">
                    KREO<span className="klp-nav-title-accent">MAX</span>
                  </span>
                  <span className="klp-footer-subtitle">CREATOR STUDIO</span>
                </div>
              </div>
              <p className="klp-footer-desc">
                Transform creative curiosity into certified real-world AI projects. Master screenplay writing, cinematic art, movie directing, and interactive web publishing.
              </p>
              <div className="klp-footer-veteran-badge">
                <Award size={18} className="klp-veteran-icon" />
                <div>
                  <strong>Created by Experts with 30+ Years of Experience</strong>
                  <span>Across IT, AI & Digital Innovation</span>
                </div>
              </div>
            </div>

            {/* Column 2: Creator Pathways */}
            <div className="klp-footer-col">
              <h4 className="klp-footer-col-title">Creator Pathways</h4>
              <ul className="klp-footer-links">
                <li>
                  <button type="button" onClick={() => setShowPaymentModal(true)}>Creator Cohort (24 Hrs · 2 Months)</button>
                </li>
                <li>
                  <button type="button" onClick={() => setShowPaymentModal(true)}>1:1 Creator Mentorship (30 Hrs)</button>
                </li>
                <li>
                  <button type="button" onClick={() => document.getElementById('klp-studios')?.scrollIntoView({ behavior: 'smooth' })}>
                    6 Multimodal AI Studios
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => document.getElementById('klp-showcase')?.scrollIntoView({ behavior: 'smooth' })}>
                    Student Showcase & Capstones
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Admissions */}
            <div className="klp-footer-col">
              <h4 className="klp-footer-col-title">Admissions & Contact</h4>
              <div className="klp-footer-contact-item">
                <Phone size={15} className="klp-contact-icon" />
                <div>
                  <span className="klp-contact-label">WhatsApp / Helpline:</span>
                  <a
                    href="https://wa.me/918310590859?text=Hi%20Kreomax%20Admissions%2C%20I%20would%20like%20to%20know%20more%20about%20the%20Creator%20Cohorts."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="klp-contact-link"
                  >
                    +91 8310590859
                  </a>
                </div>
              </div>
              <a
                href="https://wa.me/918310590859?text=Hi%20Kreomax%20Admissions%2C%20I%20would%20like%20to%20know%20more%20about%20the%20Creator%20Cohorts."
                target="_blank"
                rel="noopener noreferrer"
                className="klp-footer-wa-pill"
              >
                <MessageCircle size={15} /> Chat with Admissions on WhatsApp
              </a>
            </div>

            {/* Column 4: Address */}
            <div className="klp-footer-col">
              <h4 className="klp-footer-col-title">Studio Address</h4>
              <div className="klp-footer-contact-item">
                <MapPin size={16} className="klp-contact-icon" />
                <div className="klp-footer-address">
                  <strong>Kreomax Creative Labs</strong>
                  <span>No: 50, Kodigehalli Main Road</span>
                  <span>Bangalore, Karnataka, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-footer Bottom Bar */}
          <div className="klp-footer-bottom">
            <div className="klp-footer-copy">
              © {new Date().getFullYear()} Kreomax Creator Studio. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Razorpay Payment & Pathway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccessUnlock={(planId) => {
          setShowPaymentModal(false);
          onLaunchStudio('roadmap');
        }}
      />

    </div>
  );
}

export default KreomaxLandingPage;
