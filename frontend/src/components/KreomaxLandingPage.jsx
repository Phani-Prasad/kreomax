import React, { useState, useEffect } from 'react';
import { KreomaxIcon } from './KreomaxLogo';
import { ApplyModal } from './ApplyModal';
import { GameMap } from './GameMap';
import { HeroCarousel } from './HeroCarousel';
import { AskBuddySection } from './AskBuddy';
import { whatsappLink } from '../data/contact';
import { SkillRadarSection } from './SkillRadar';
import { skillsForLevel } from '../data/skills';
import {
  BookOpen,
  Cpu,
  Image as ImageIcon,
  Video,
  Layout,
  Award,
  ArrowRight,
  Sparkles,

  CheckCircle2,
  Coffee,
  DoorOpen,
  Images,
  Zap,
  Star,
  Menu,
  X,
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
    engine: 'AI Writing',
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
    engine: 'AI Research',
    icon: Cpu,
    color: '#6D4FD8',
    glow: 'rgba(109, 79, 216,0.35)',
    output: 'Research Guide',
    preview: 'Verified Fact · Source: NASA LRO 2024\n"Moon\'s south pole holds ~600M tons\nof water ice for rocket propellant."'
  },
  {
    id: 'visual',
    level: 3,
    name: 'Visual Studio',
    tagline: 'Generate cinematic concept art',
    engine: 'AI Art',
    icon: ImageIcon,
    color: '#7C3AED',
    glow: 'rgba(124,58,237,0.35)',
    output: 'Concept Art Pack',
    preview: 'Cinematic 16:9 · Astronaut on Shackleton Rim\nStyle: cinematic 3D render\nAnamorphic lens flare · 8K render'
  },
  {
    id: 'motion',
    level: 4,
    name: 'Motion Studio',
    tagline: 'Animate scenes into trailers',
    engine: 'AI Video',
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
    preview: 'Story · Research · Art\nTrailer · Website bundled\n100-point rubric evaluation\nCertified · Score: 98/100'
  }
];

/* Student Showcase Projects */
const STUDENT_PROJECTS = [
  {
    title: 'Chandrayaan Space Odyssey',
    student: 'Space & science theme',
    cohort: 'Sample project',
    coverImg: '/images/level-1-story.webp',
    score: 'Sample',
    color: '#6D4FD8',
    tags: ['Screenplay', 'Research', 'Concept Art', 'Trailer', 'Website']
  },
  {
    title: 'Cyber Mecha Titans 2050',
    student: 'Robotics & sci-fi theme',
    cohort: 'Sample project',
    coverImg: '/images/level-4-motion.webp',
    score: 'Sample',
    color: '#7C3AED',
    tags: ['Mecha Script', 'Exo-Science', '4K Mecha Art', 'Arena Reel', 'Web Hub']
  },
  {
    title: 'Sky Dragon Chronicles',
    student: 'Fantasy & animation theme',
    cohort: 'Sample project',
    coverImg: '/images/level-3-visual.webp',
    score: 'Sample',
    color: '#059669',
    tags: ['Dragon Script', 'Aerodynamics', 'Ghibli Art', 'Flight Reel', 'Showcase']
  }
];

/* Output Pipeline Steps */
const PIPELINE = [
  { img: 'skill-story', label: 'Screenplay', sub: 'Your story, your world', hours: 'Hours 1-4', color: '#10B981' },
  { img: 'skill-research', label: 'Research Guide', sub: 'Fact-checked with sources', hours: 'Hours 5-8', color: '#4C7DFF' },
  { img: 'skill-visual', label: 'Concept Art', sub: 'One style, every scene', hours: 'Hours 9-12', color: '#8B5CF6' },
  { img: 'skill-motion', label: 'Video Trailer', sub: '32-second movie reel', hours: 'Hours 13-16', color: '#EC4899' },
  { img: 'skill-web', label: 'Live Website', sub: 'Your showcase page', hours: 'Hours 17-20', color: '#F59E0B' },
  { img: 'skill-certificate', label: 'Certificate', sub: 'Graded and verified', hours: 'Hours 21-24', color: '#0EA5E9' },
];

/* Hero Slides with Motions */

// Marker positions are percentages of /images/kreomax-city.webp.
// `studio` indexes STUDIOS; extras open the enrolment modal instead.
const CITY_MARKERS = [
  { id: 'l1', label: '1', short: 'Story', title: 'Story Studio', output: 'Story Script', color: '#10B981', x: 16, y: 50, studio: 0 },
  { id: 'l2', label: '2', short: 'Research', title: 'Research Lab', output: 'Research Guide', color: '#4C7DFF', x: 16, y: 26, studio: 1 },
  { id: 'l3', label: '3', short: 'Visual', title: 'Visual Studio', output: 'Concept Art', color: '#8B5CF6', x: 35, y: 32, studio: 2 },
  { id: 'l4', label: '4', short: 'Motion', title: 'Motion Studio', output: 'Video Trailer', color: '#EC4899', x: 53, y: 24, studio: 3 },
  { id: 'l5', label: '5', short: 'Web', title: 'Web Builder', output: 'Live Website', color: '#F59E0B', x: 71, y: 24, studio: 4 },
  { id: 'l6', label: '6', short: 'Final', title: 'Final Project', output: 'Certificate', color: '#0EA5E9', x: 88, y: 16, studio: 5 },
  { id: 'x1', icon: DoorOpen, short: 'Cohort', title: 'Creator Cohort', output: 'Enrol at the gate', plan: 'cohort-24h', blurb: 'A 24-hour weekend cohort that takes you through all six levels with a mentor.', cta: 'Apply for a cohort', color: '#6D4FD8', x: 20, y: 84, studio: null },
  { id: 'x2', icon: Coffee, short: 'Mentor', title: '1:1 Mentorship', output: 'Mentor cafe', plan: 'training-1on1-30h', blurb: 'Personal guidance when you are stuck, with a mentor who knows your project.', cta: 'Ask about mentorship', color: '#6D4FD8', x: 60, y: 57, studio: null },
  { id: 'x3', icon: Images, short: 'Showcase', title: 'Student Showcase', output: 'Gallery pavilion', plan: 'cohort-24h', blurb: 'Every finished project goes on display, ready to share with family and friends.', cta: 'Apply for a cohort', color: '#6D4FD8', x: 90, y: 43, studio: null },
];

// Audience content — kept factual to what the product actually offers.
const AUDIENCES = {
  families: {
    label: 'Parents & Students',
    eyebrow: 'For families',
    title: 'Screen time that ends with something real',
    body: 'Your child moves from "I use AI" to "I made this" - a story, concept art, a trailer and a live website, guided step by step.',
    points: [
      'A clear 24-hour path across 6 levels - no guessing what to do next',
      'Mentor-led cohorts and optional 1:1 mentorship',
      'Visible milestones, real deliverables and a rubric-graded certificate',
      'Builds seven core thinking skills, from critical thinking to self-learning',
    ],
  },
  schools: {
    label: 'Schools & Institutions',
    eyebrow: 'For schools',
    title: 'A ready-to-run AI creativity programme',
    body: 'Bring a structured, hands-on creator curriculum to your innovation lab, club or classroom without building one from scratch.',
    points: [
      'Same 24-hour, 6-level curriculum with a trainer guide for facilitators',
      'Student progress tracking and rubric-based evaluation',
      'Certificates and portfolio outputs students can present',
      'Builds seven core thinking skills across every level',
    ],
    cta: 'Talk to us about your school',
  },
};

export function KreomaxLandingPage({ onLaunchStudio, onOpenKeyModal }) {
  const [selectedId, setSelectedId] = useState('l1');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyPlanId, setApplyPlanId] = useState(null);
  const openApply = (planId) => { setApplyPlanId(planId || null); setShowApplyModal(true); };
  // Launching the studio asks for an access code first (handled in App).
  const primaryAction = () => onLaunchStudio('roadmap');
  const startLabel = 'Start Building Now';
  const launchLabel = 'Launch Studio';
  const [audience, setAudience] = useState('families');

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const selected = CITY_MARKERS.find((m) => m.id === selectedId) || CITY_MARKERS[0];
  const selStudio = selected.studio === null ? null : STUDIOS[selected.studio];

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
            <button className="klp-nav-link" onClick={() => document.getElementById('klp-city')?.scrollIntoView({ behavior: 'smooth' })}>Explore</button>
            <button className="klp-nav-link" onClick={() => document.getElementById('klp-showcase')?.scrollIntoView({ behavior: 'smooth' })}>Sample Projects</button>
            <button className="klp-cta-btn klp-cta-btn--sm" onClick={primaryAction}>
              {launchLabel} <ArrowRight size={14} />
            </button>
          </div>

          <button className="klp-mobile-menu-btn" aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(v => !v)}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="klp-mobile-menu">
            <button className="klp-mobile-link" onClick={() => { document.getElementById('klp-city')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Explore</button>
            <button className="klp-mobile-link" onClick={() => { document.getElementById('klp-showcase')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Sample Projects</button>
            <button className="klp-cta-btn klp-cta-btn--full" onClick={() => { primaryAction(); setIsMobileMenuOpen(false); }}>{launchLabel}</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className={`klp-hero ${heroVisible ? 'klp-hero--visible' : ''}`}>
        <div className="klp-hero-bg-glow klp-hero-bg-glow--1" />
        <div className="klp-hero-bg-glow klp-hero-bg-glow--2" />
        <div className="klp-hero-bg-glow klp-hero-bg-glow--3" />

        <HeroCarousel
          onStart={primaryAction}
          startLabel={startLabel}
          onExplore={() => document.getElementById('klp-city')?.scrollIntoView({ behavior: 'smooth' })}
        />

      </section>

      {/* AUDIENCES */}
      <section className="klp-section klp-audience-section" id="klp-audience">
        <div className="klp-section-inner">
          <div className="klp-audience-tabs" role="tablist" aria-label="Who is this for">
            {Object.entries(AUDIENCES).map(([key, a]) => (
              <button
                key={key}
                role="tab"
                id={`klp-aud-tab-${key}`}
                aria-selected={audience === key}
                aria-controls="klp-aud-panel"
                className={`klp-audience-tab ${audience === key ? 'klp-audience-tab--active' : ''}`}
                onClick={() => setAudience(key)}
              >
                {a.label}
              </button>
            ))}
          </div>
          {(() => {
            const a = AUDIENCES[audience];
            const isSchool = audience === 'schools';
            return (
              <div className="klp-audience-panel" id="klp-aud-panel" role="tabpanel" aria-labelledby={`klp-aud-tab-${audience}`}>
                <div className="klp-audience-copy">
                  <div className="klp-section-eyebrow"><Sparkles size={13} /> {a.eyebrow}</div>
                  <h2 className="klp-section-title klp-audience-title">{a.title}</h2>
                  <p className="klp-audience-body">{a.body}</p>
                  <ul className="klp-audience-points">
                    {a.points.map((pt) => (
                      <li key={pt}><CheckCircle2 size={18} aria-hidden="true" /> <span>{pt}</span></li>
                    ))}
                  </ul>
                  {isSchool ? (
                    <a
                      className="klp-cta-btn klp-cta-btn--primary"
                      href="https://wa.me/918310590859?text=Hi%20Kreomax%2C%20we%20are%20a%20school%20interested%20in%20the%20Creator%20programme.%20Please%20share%20details."
                      target="_blank" rel="noopener noreferrer"
                    >
                      {a.cta} <ArrowRight size={16} />
                    </a>
                  ) : null}
                </div>
                <div className="klp-audience-visual">
                  <img
                    src={isSchool ? '/images/schools.webp' : '/images/parents.webp'}
                    alt={isSchool
                      ? 'A teacher showing class progress on a smart board to students with a friendly AI robot'
                      : 'A parent and child building a project together, with a progress card, certificate and robot buddy'}
                    width="1100" height="802" loading="lazy" decoding="async"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* CREATOR STATS (thinking skills) */}
      <SkillRadarSection />

      {/* KREOMAX CITY */}
      <section className="klp-section klp-city-section" id="klp-city">
        <div className="klp-section-inner">
          <div className="klp-section-header">
            <div className="klp-section-eyebrow"><Sparkles size={13} /> Explore the city</div>
            <h2 className="klp-section-title">Welcome to Kreomax City</h2>
            <p className="klp-section-sub">Every building is a skill. Tap a building to see what you will make there.</p>
          </div>
          <GameMap
            image="/images/kreomax-city.webp"
            alt="Illustrated Kreomax City: a library, observatory, art studio, cinema, web workshop and town hall along a glowing road, with a mentor cafe and gallery"
            width={1600}
            height={978}
            markers={CITY_MARKERS}
            legendTitle="City key"
            selectedId={selected.id}
            onSelect={(m) => setSelectedId(m.id)}
            aside={
              <div className="klp-city-detail" style={{ '--studio-color': selected.color }} key={selected.id}>
                <span className="klp-city-detail-tag">
                  {selStudio ? `Level ${selStudio.level} · ${selStudio.engine}` : 'Beyond the levels'}
                </span>
                <h3 className="klp-city-detail-title">{selStudio ? selStudio.name : selected.title}</h3>
                <p className="klp-city-detail-text">{selStudio ? selStudio.tagline : selected.blurb}</p>
                {selStudio && (
                  <p className="klp-city-detail-meta">
                    Hours {(selStudio.level - 1) * 4 + 1}-{selStudio.level * 4} · four one-hour sessions
                  </p>
                )}
                {selStudio && (
                  <div className="klp-city-skills" aria-label="Thinking skills exercised here">
                    {skillsForLevel(selStudio.level).map((sk) => (
                      <span key={sk.id} className="klp-city-skill" style={{ '--sk-color': sk.color }}>{sk.short}</span>
                    ))}
                  </div>
                )}
                <span className="klp-city-detail-out">
                  <Award size={15} aria-hidden="true" /> You make: {selStudio ? selStudio.output : selected.output}
                </span>
                <button className="klp-cta-btn klp-cta-btn--primary" onClick={() => (selStudio ? onLaunchStudio(selStudio.id) : openApply(selected.plan))}>
                  {selStudio ? `Open ${selStudio.name}` : selected.cta} <ArrowRight size={16} />
                </button>
              </div>
            }
          />
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

          <ol className="klp-journey">
            {PIPELINE.map((step, i) => (
              <li key={step.label} className="klp-journey-step" style={{ '--step-color': step.color }}>
                <span className="klp-journey-num" aria-hidden="true">{i + 1}</span>
                <img
                  className="klp-journey-img"
                  src={`/images/${step.img}.webp`}
                  alt=""
                  width="800" height="500" loading="lazy" decoding="async"
                />
                <span className="klp-journey-hours">{step.hours}</span>
                <span className="klp-journey-label">{step.label}</span>
                <span className="klp-journey-sub">{step.sub}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* STUDENT SHOWCASE */}
      <section className="klp-section klp-showcase-section" id="klp-showcase">
        <div className="klp-section-inner">
          <div className="klp-section-header">
            <div className="klp-section-eyebrow">
              <Star size={13} /> Sample projects
            </div>
            <h2 className="klp-section-title">
              What a finished portfolio looks like
            </h2>
            <p className="klp-section-sub">
              Sample projects showing the kind of work students build across the six levels.
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
                    width="900" height="675" loading="lazy" decoding="async"
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

      {/* FAQ */}
      <AskBuddySection />

      {/* BOTTOM CTA BAND */}
      <section className="klp-cta-section klp-cta-section--split">
        <div className="klp-cta-card">
          <div className="klp-cta-copy">
            <div className="klp-hero-badge">
              <Sparkles size={13} /> Start today - no experience needed
            </div>
            <h2 className="klp-cta-title">
              Your first creation is <span className="klp-gradient-text">one hour away.</span>
            </h2>
            <p className="klp-cta-sub">
              Pick a level, meet your AI buddy, and make something you are proud to share.
            </p>
            <div className="klp-cta-actions">
              <a
                className="klp-intro-pill"
                href={whatsappLink('Hi Kreomax, I would like to book the intro class (₹199). My name is ')}
                target="_blank" rel="noopener noreferrer"
              >
                <span className="klp-intro-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
                <span className="klp-intro-text">Intro Class <strong>₹199</strong></span>
              </a>
              <button className="klp-cta-btn klp-cta-btn--ghost klp-cta-btn--lg" onClick={primaryAction}>
                {startLabel}
              </button>
            </div>
            <p className="klp-cta-hint">Book the intro class on WhatsApp. We confirm the date and details with you there.</p>
            <p className="klp-cta-facts">24 guided hours · 6 creative studios · 5 real deliverables · 1 certificate</p>
          </div>
          <img
            className="klp-cta-photo"
            src="/images/hero.webp"
            alt="Two students and their robot buddy creating a screenplay, concept art and a video together"
            width="1100" height="1035" loading="lazy" decoding="async"
          />
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
                  <button type="button" onClick={() => openApply('cohort-24h')}>Creator Cohort (24 Hrs · 2 Months)</button>
                </li>
                <li>
                  <button type="button" onClick={() => openApply('training-1on1-30h')}>1:1 Creator Mentorship (30 Hrs)</button>
                </li>
                <li>
                  <button type="button" onClick={() => document.getElementById('klp-city')?.scrollIntoView({ behavior: 'smooth' })}>
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
            <nav className="klp-footer-legal" aria-label="Policies">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
            </nav>
          </div>
        </div>
      </footer>

      {/* Programme enquiry / application form */}
      <ApplyModal
        isOpen={showApplyModal}
        initialPlanId={applyPlanId}
        onClose={() => { setShowApplyModal(false); setApplyPlanId(null); }}
      />

    </div>
  );
}

export default KreomaxLandingPage;
