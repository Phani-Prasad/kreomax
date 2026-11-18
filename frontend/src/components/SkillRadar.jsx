import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, ListChecks, Layers, Search, Lightbulb, Puzzle, MessagesSquare, Compass, Pause, Play } from 'lucide-react';
import { SKILLS, LEVEL_SKILLS, LEVELS, levelsForSkill } from '../data/skills';
import './SkillRadar.css';

const ICONS = {
  logical: ListChecks,
  memory: Layers,
  critical: Search,
  creative: Lightbulb,
  problem: Puzzle,
  communication: MessagesSquare,
  metacognition: Compass,
};

const N = SKILLS.length;
const angleOf = (i) => (-90 + (360 / N) * i) * (Math.PI / 180);
const point = (i, r) => [50 + Math.cos(angleOf(i)) * r, 50 + Math.sin(angleOf(i)) * r];
const NODE_R = 39; // % of the box, orb centres
const MAX_R = 29; // % of the box, polygon at 100%
const MIN_R = 5;

/** Fraction (0..1) of each skill reached once levels 1..level are complete. */
function progressAt(level) {
  return SKILLS.map((sk) => {
    const total = levelsForSkill(sk.id).length;
    const done = levelsForSkill(sk.id).filter((l) => l <= level).length;
    return total ? done / total : 0;
  });
}

/** Smoothly animate an array of numbers toward a target (instant when motion is reduced). */
function useTween(target, reduced) {
  const [value, setValue] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    if (reduced) { ref.current = target; return undefined; }
    const from = ref.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 650);
      const e = 1 - Math.pow(1 - t, 3);
      const next = target.map((v, i) => from[i] + (v - from[i]) * e);
      ref.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return reduced ? target : value;
}

export function SkillRadar() {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [level, setLevel] = useState(1);
  const [focus, setFocus] = useState(null); // skill id or null
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef(null);
  const autoPlayed = useRef(false);

  const target = useMemo(() => progressAt(level), [level]);
  const shown = useTween(target, reduced);

  // Play through the levels once, the first time the radar is mostly on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !autoPlayed.current) {
        autoPlayed.current = true;
        setPlaying(true);
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const isPlaying = playing && level < 6; // playback ends by itself at the last level
  useEffect(() => {
    if (!isPlaying) return undefined;
    const t = setTimeout(() => setLevel((l) => l + 1), 1900);
    return () => clearTimeout(t);
  }, [isPlaying, level]);

  const polygon = shown.map((v, i) => point(i, MIN_R + (MAX_R - MIN_R) * v).join(',')).join(' ');
  const trained = new Set(LEVEL_SKILLS[level]);
  const lvl = LEVELS[level - 1];
  const focusSkill = focus ? SKILLS.find((s) => s.id === focus) : null;

  const pickLevel = (l) => { setFocus(null); setPlaying(false); setLevel(l); };
  const togglePlay = () => {
    if (isPlaying) { setPlaying(false); return; }
    setFocus(null);
    if (level >= 6) setLevel(1);
    setPlaying(true);
  };

  return (
    <div className="sr" ref={rootRef}>
      <div className="sr-board">
        <div className="sr-box">
          <svg className="sr-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="sr-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8B73E8" stopOpacity="0.55" />
                <stop offset="1" stopColor="#4C7DFF" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            {[1, 0.66, 0.33].map((k) => (
              <polygon
                key={k}
                className="sr-ring"
                points={SKILLS.map((_, i) => point(i, MIN_R + (MAX_R - MIN_R) * k).join(',')).join(' ')}
              />
            ))}
            {SKILLS.map((_, i) => {
              const [x, y] = point(i, MAX_R);
              return <line key={i} className="sr-spoke" x1="50" y1="50" x2={x} y2={y} />;
            })}
            <polygon className="sr-area" points={polygon} fill="url(#sr-fill)" />
            {shown.map((v, i) => {
              const [x, y] = point(i, MIN_R + (MAX_R - MIN_R) * v);
              return <circle key={i} className="sr-dot" cx={x} cy={y} r="1.2" fill={SKILLS[i].color} />;
            })}
          </svg>

          <img className="sr-buddy" src="/images/mascot-wave.webp" alt="" width="640" height="576" loading="lazy" decoding="async" />

          {SKILLS.map((sk, i) => {
            const Icon = ICONS[sk.id];
            const [x, y] = point(i, NODE_R);
            const lit = target[i] > 0;
            const active = trained.has(sk.id);
            return (
              <button
                key={sk.id}
                type="button"
                className={`sr-node ${lit ? 'sr-node--lit' : ''} ${active ? 'sr-node--active' : ''} ${focus === sk.id ? 'sr-node--focus' : ''}`}
                style={{ left: `${x}%`, top: `${y}%`, '--sk-color': sk.color }}
                onClick={() => { setPlaying(false); setFocus(focus === sk.id ? null : sk.id); }}
                aria-pressed={focus === sk.id}
                aria-label={`${sk.title}. Practised in ${levelsForSkill(sk.id).map((l) => `level ${l}`).join(' and ')}.`}
              >
                <span className="sr-orb"><Icon size={20} aria-hidden="true" />{active && <span className="sr-plus" aria-hidden="true">+</span>}</span>
                <span className="sr-label">{sk.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sr-side">
        <div className="sr-levels" role="group" aria-label="Choose a level">
          {LEVELS.map((l) => (
            <button
              key={l.n}
              type="button"
              className={`sr-level ${level === l.n ? 'sr-level--on' : ''} ${l.n < level ? 'sr-level--done' : ''}`}
              onClick={() => pickLevel(l.n)}
              aria-pressed={level === l.n}
              style={{ '--lv-color': l.color }}
            >
              <span className="sr-level-n">{l.n}</span>
              <span className="sr-level-text">
                <span className="sr-level-name">{l.name}</span>
                <span className="sr-level-out">You make {l.output}</span>
              </span>
              <span className="sr-level-dots" aria-hidden="true">
                {LEVEL_SKILLS[l.n].map((id) => (
                  <i key={id} style={{ background: SKILLS.find((x) => x.id === id).color }} />
                ))}
              </span>
            </button>
          ))}
          <button type="button" className="sr-play" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play through all six levels'}>
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>

        <div className="sr-panel" aria-live="polite" style={{ '--lv-color': focusSkill ? focusSkill.color : lvl.color }}>
          {focusSkill ? (
            <>
              <p className="sr-panel-tag">Creator skill</p>
              <h3 className="sr-panel-title">{focusSkill.title}</h3>
              <p className="sr-panel-text">{focusSkill.line}</p>
              <p className="sr-panel-row">
                <span className="sr-panel-key">Practised in</span>
                {levelsForSkill(focusSkill.id).map((l) => (
                  <button key={l} type="button" className="sr-chip sr-chip--btn" onClick={() => pickLevel(l)}>
                    Level {l} · {LEVELS[l - 1].name}
                  </button>
                ))}
              </p>
            </>
          ) : (
            <>
              <p className="sr-panel-tag">Level {lvl.n} · {lvl.name}</p>
              <h3 className="sr-panel-title">You make: {lvl.output}</h3>
              <p className="sr-panel-row">
                <span className="sr-panel-key">Skills exercised</span>
                {LEVEL_SKILLS[level].map((id) => {
                  const sk = SKILLS.find((s) => s.id === id);
                  return (
                    <button key={id} type="button" className="sr-chip sr-chip--btn" style={{ '--sk-color': sk.color }} onClick={() => setFocus(id)}>
                      {sk.title}
                    </button>
                  );
                })}
              </p>
              <p className="sr-panel-text sr-panel-hint">
                {level < 6
                  ? 'Move to the next level and watch the radar grow.'
                  : 'All seven skills are now exercised. Select any orb to see where it was practised.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkillRadarSection() {
  return (
    <section className="klp-section klp-radar-section" id="klp-thinking">
      <div className="klp-section-inner">
        <div className="klp-section-header">
          <div className="klp-section-eyebrow"><Brain size={13} /> Creator stats</div>
          <h2 className="klp-section-title">Level up your mind, not just your portfolio</h2>
          <p className="klp-section-sub">Every studio exercises the way you think. Press play and watch your seven creator skills grow.</p>
        </div>
        <SkillRadar />
      </div>
    </section>
  );
}
