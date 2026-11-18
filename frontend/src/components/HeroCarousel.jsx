import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import './HeroCarousel.css';

/* Hero carousel. Artwork is text-free; captions are positioned over it as a
   percentage of the image (x / y = centre of the caption), so they stay crisp
   and editable. */
const SLIDES = [
  {
    id: 'vision',
    eyebrow: 'Our vision',
    title: ['Where ideas become', 'real creations.'],
    body: 'Kreomax is the AI creator studio for young learners: students build, parents see progress, and schools and teachers get a ready-to-run programme.',
    image: '/images/hero-slide-1.webp',
    alt: 'Glass tiles for Students, Schools and Teachers, and Parents around a glowing Kreomax cube on a glass platform',
    captions: [
      { text: 'Schools & Teachers', x: 50.5, y: 72 },
      { text: 'KREOMAX', x: 68, y: 79, brand: true },
      { text: 'Students', x: 69, y: 9 },
      { text: 'Parents', x: 88.5, y: 72 },
    ],
  },
  {
    id: 'approach',
    eyebrow: 'Our approach',
    title: ['From idea to', 'portfolio.'],
    body: 'A guided 24-hour journey: imagine a story, create it with AI, and showcase a finished portfolio, one hour at a time.',
    image: '/images/hero-slide-2.webp',
    alt: 'Three glass steps rising left to right: a spark, a brush on a film frame, and a trophy',
    captions: [
      { text: 'Imagine', x: 48.8, y: 88 },
      { text: 'Create', x: 67.4, y: 85.5 },
      { text: 'Showcase', x: 86.8, y: 83.5 },
    ],
  },
  {
    id: 'journey',
    copyTop: true, // artwork reaches further left, so lift the text clear of it
    eyebrow: 'Our journey',
    title: ['Six levels.', 'One finished portfolio.'],
    body: 'Story, research, art, video, website and a certificate: every level ends with something the student made.',
    image: '/images/hero-slide-3.webp',
    alt: 'Six glass tiles rising along a curve: quill, research, palette, clapperboard, website and certificate',
    captions: [
      { text: 'Story', x: 37, y: 81 },
      { text: 'Research', x: 48, y: 75 },
      { text: 'Art', x: 59, y: 69 },
      { text: 'Video', x: 70, y: 62 },
      { text: 'Web', x: 81, y: 56 },
      { text: 'Certificate', x: 92, y: 52 },
    ],
  },
];

const INTERVAL_MS = 7000;

export function HeroCarousel({ onStart, onExplore, startLabel = 'Start Building Now' }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const [hovering, setHovering] = useState(false);
  const rootRef = useRef(null);

  const go = (i) => setIndex((i + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (!playing || hovering) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, playing, hovering]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  };

  return (
    <div
      className="hc"
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="What Kreomax is about"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      onKeyDown={onKeyDown}
    >
      <div className="hc-stage" aria-live={playing ? 'off' : 'polite'}>
        {SLIDES.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.id}
              className={`hc-slide ${active ? 'hc-slide--active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
              aria-hidden={!active}
              inert={!active}
            >
              <div className="hc-art">
                <img
                  src={s.image}
                  alt={s.alt}
                  width="1600"
                  height="800"
                  decoding="sync"
                  loading="eager"
                  fetchpriority={i === 0 ? 'high' : 'auto'}
                />
                {s.captions.map((c) => (
                  <span key={c.text} className={`hc-caption ${c.brand ? 'hc-caption--brand' : ''}`} style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                    {c.text}
                  </span>
                ))}
              </div>

              <div className={`hc-copy ${s.copyTop ? 'hc-copy--top' : ''}`}>
                <p className="hc-eyebrow">{s.eyebrow}</p>
                {i === 0 ? (
                  <h1 className="hc-title">
                    {s.title[0]} <span className="hc-accent">{s.title[1]}</span>
                  </h1>
                ) : (
                  <h2 className="hc-title">
                    {s.title[0]} <span className="hc-accent">{s.title[1]}</span>
                  </h2>
                )}
                <p className="hc-body">{s.body}</p>
                <div className="hc-actions">
                  <button type="button" className="klp-cta-btn klp-cta-btn--primary" onClick={onStart}>
                    <Play size={16} fill="currentColor" aria-hidden="true" /> {startLabel}
                  </button>
                  <button type="button" className="klp-cta-btn klp-cta-btn--ghost" onClick={onExplore}>
                    Explore the City <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hc-controls">
        <button type="button" className="hc-icon-btn" onClick={() => go(index - 1)} aria-label="Previous slide">
          <ChevronLeft size={16} />
        </button>
        <div className="hc-dots" role="tablist" aria-label="Choose slide">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}: ${s.eyebrow}`}
              className={`hc-dot ${i === index ? 'hc-dot--active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="hc-icon-btn" onClick={() => go(index + 1)} aria-label="Next slide">
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className="hc-icon-btn"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
    </div>
  );
}
