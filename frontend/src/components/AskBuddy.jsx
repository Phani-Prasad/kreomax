import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, Users } from 'lucide-react';
import { FAQ_GROUPS } from '../data/faq';
import { whatsappLink } from '../data/contact';
import './AskBuddy.css';

const TYPING_MS = 700;

function initialThread(group) {
  return [{ id: `greet-${group.id}`, from: 'bot', text: group.greeting }];
}

export function AskBuddySection() {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [groupId, setGroupId] = useState(FAQ_GROUPS[0].id);
  const [thread, setThread] = useState(() => initialThread(FAQ_GROUPS[0]));
  const [typing, setTyping] = useState(false);
  const logRef = useRef(null);
  const timer = useRef(null);

  const group = FAQ_GROUPS.find((g) => g.id === groupId);
  const asked = new Set(thread.filter((m) => m.from === 'user').map((m) => m.text));
  const remaining = group.items.filter((it) => !asked.has(it.q));

  // keep the newest message in view without scrolling the page
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [thread, typing, reduced]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const switchGroup = (id) => {
    clearTimeout(timer.current);
    setTyping(false);
    setGroupId(id);
    setThread(initialThread(FAQ_GROUPS.find((g) => g.id === id)));
  };

  const ask = (item) => {
    if (typing) return;
    setThread((t) => [...t, { id: `u-${item.q}`, from: 'user', text: item.q }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setThread((t) => [...t, { id: `b-${item.q}`, from: 'bot', text: item.a, link: item.link, cta: item.cta }]);
    }, reduced ? 0 : TYPING_MS);
  };

  return (
    <section className="klp-section kab-section" id="klp-faq">
      <div className="klp-section-inner kab-grid">
        {/* Left: intro + buddy */}
        <div className="kab-intro">
          <div className="klp-section-eyebrow kab-eyebrow"><Sparkles size={13} /> Questions</div>
          <h2 className="kab-title">Curious? <span className="kab-accent">Just ask.</span></h2>
          <p className="kab-sub">Pick who you are, tap a question, and your Kreomax buddy answers.</p>

          <div className="kab-collage">
            <figure className="kab-shot kab-shot--main">
              <img src="/images/cohort-main.webp" alt="Two students at laptops in a live online class, with their mentor on a large screen and a friendly robot beside them" width="827" height="1145" loading="lazy" decoding="async" />
              <figcaption className="kab-tag"><Users size={15} aria-hidden="true" /> Live weekend cohorts</figcaption>
            </figure>
            <figure className="kab-shot kab-shot--demo">
              <img src="/images/cohort-demo.webp" alt="Students clapping at a demo day as a finished website and trailer appear on a big screen" width="534" height="567" loading="lazy" decoding="async" />
            </figure>
            <figure className="kab-shot kab-shot--create">
              <img src="/images/cohort-create.webp" alt="A student drawing concept art on a tablet while a robot buddy watches" width="534" height="567" loading="lazy" decoding="async" />
              <figcaption className="kab-tag kab-tag--green">Ages 12+</figcaption>
            </figure>
          </div>
        </div>

        {/* Right: the chat */}
        <div className="kab-chat">
          <div className="kab-tabs" role="tablist" aria-label="Who is asking">
            {FAQ_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                id={`kab-tab-${g.id}`}
                aria-selected={g.id === groupId}
                aria-controls="kab-panel"
                className={`kab-tab ${g.id === groupId ? 'kab-tab--on' : ''}`}
                onClick={() => switchGroup(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div id="kab-panel" role="tabpanel" aria-labelledby={`kab-tab-${groupId}`}>
            <div className="kab-log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation with your Kreomax buddy">
              {thread.map((m) => (
                <div key={m.id} className={`kab-msg kab-msg--${m.from}`}>
                  {m.from === 'bot' && <img className="kab-avatar" src="/images/mascot-wave.webp" alt="" width="64" height="58" />}
                  <div className="kab-bubble">
                    <p>{m.text}</p>
                    {m.link && <a href={m.link.href}>{m.link.label}</a>}
                    {m.cta === 'whatsapp-school' && (
                      <a
                        href={whatsappLink('Hi Kreomax, we are a school interested in the Creator programme. Please share details.')}
                        target="_blank" rel="noopener noreferrer"
                      >
                        Message us on WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="kab-msg kab-msg--bot" aria-hidden="true">
                  <img className="kab-avatar" src="/images/mascot-wave.webp" alt="" width="64" height="58" />
                  <div className="kab-bubble kab-typing"><i /><i /><i /></div>
                </div>
              )}
            </div>

            <div className="kab-asks">
              {remaining.length > 0 ? (
                <>
                  <p className="kab-asks-label">Tap a question</p>
                  <div className="kab-chips">
                    {remaining.map((it) => (
                      <button key={it.q} type="button" className="kab-ask" onClick={() => ask(it)} disabled={typing}>
                        <Send size={13} aria-hidden="true" /> {it.q}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="kab-asks-label">That is everything I know here. Anything else?</p>
              )}
            </div>
          </div>

          <div className="kab-foot">
            <span>Still have questions?</span>
            <a
              href={whatsappLink('Hi Kreomax, I have a question about the programme.')}
              target="_blank" rel="noopener noreferrer"
            >
              <MessageCircle size={15} aria-hidden="true" /> Ask us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
