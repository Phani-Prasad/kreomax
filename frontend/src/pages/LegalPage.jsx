import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { KreomaxIcon } from '../components/KreomaxLogo';
import { whatsappLink, WHATSAPP_NUMBER } from '../data/contact';
import './LegalPage.css';

/* Set to false once the policies have been reviewed and finalised by Kreomax. */
const SHOW_DRAFT_NOTICE = true;

const COMPANY = 'Kreomax Creative Labs';
const ADDRESS = 'Bangalore, Karnataka, India';
const UPDATED = 'Last updated: [date to be added when published]';

// "todo" blocks are decisions only Kreomax can make; they render as highlighted placeholders.
const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    intro: `This policy explains what information ${COMPANY} (Kreomax Creator Studio) collects, why we collect it and the choices you have.`,
    sections: [
      {
        h: 'What we collect',
        p: [
          'Details you submit in an enquiry or application form: student name, email address, phone number, grade and any notes you add.',
          'Learning information created in the Kreomax workspace: progress, the prompts and text students write, and the stories, images and other project outputs they create.',
          'Basic technical information needed to run the site, such as browser type and error logs.',
        ],
      },
      {
        h: 'How we use it',
        p: [
          'To respond to enquiries and manage enrolment.',
          'To run the programme: show progress, give mentor feedback, grade the final project and issue certificates.',
          'To keep the service secure and to improve it.',
        ],
      },
      {
        h: 'Children and parental consent',
        p: [
          'Kreomax is designed for students aged 12 and above. For students under 18, we ask that a parent or guardian submits or approves the enrolment details and understands this policy.',
        ],
      },
      {
        h: 'AI tools and service providers',
        p: [
          'Some features send what a student types (for example a story prompt or a research question) to third-party AI services so they can generate a response. We ask students not to enter sensitive personal information into these features.',
          'We also use service providers to host the site and deliver email and messages. They may process data on our behalf for these purposes only.',
          'We do not sell personal information. This website does not collect payment details.',
        ],
      },
      {
        h: 'How long we keep information',
        p: [
          'We keep information for as long as it is needed for the purposes above, and then delete or anonymise it, unless the law requires us to keep it. You can ask us to delete your or your child\'s information at any time.',
        ],
      },
      {
        h: 'Your choices',
        p: [
          'You can ask to see, correct or delete the information we hold, or withdraw consent for its use, by contacting us using the details below.',
        ],
      },
      {
        h: 'Security',
        p: ['We use reasonable technical and organisational measures to protect information. No online service can be guaranteed to be completely secure.'],
      },
      {
        h: 'Changes to this policy',
        p: ['We may update this policy from time to time. The date at the top shows when it last changed.'],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    intro: `These terms apply when you use the Kreomax website and programmes provided by ${COMPANY}.`,
    sections: [
      {
        h: 'Using Kreomax',
        p: [
          'You agree to use Kreomax lawfully and respectfully. Students under 18 should use it with the knowledge and consent of a parent or guardian.',
        ],
      },
      {
        h: 'Programmes and schedules',
        p: [
          'Programme content, session timings and mentors may change when needed. We will tell enrolled students about material changes.',
        ],
      },
      {
        h: 'Fees',
        p: ['This website does not take payments. Fee details are shared with you directly when you enquire, before you enrol.'],
      },
      {
        h: 'Acceptable use',
        p: [
          'Do not use Kreomax to create or share harmful, hateful, adult or misleading content, to infringe other people\'s rights, or to try to disrupt or gain unauthorised access to the service.',
        ],
      },
      {
        h: 'AI-generated content',
        p: [
          'AI tools can produce inaccurate or unsuitable results. Part of the course is learning to check facts and sources. Students are responsible for reviewing what they create before they share or submit it.',
        ],
      },
      {
        h: 'Student work',
        todo: 'Who owns student projects, and whether Kreomax may showcase them (and with what permission), is a decision for Kreomax. Add the wording here.',
      },
      {
        h: 'Liability',
        todo: 'Add the limitation of liability wording your legal adviser recommends.',
      },
      {
        h: 'Governing law',
        todo: 'State the governing law and the courts that have jurisdiction (for example, India and the courts of Bengaluru), if applicable.',
      },
    ],
  },

};

export const LEGAL_SLUGS = Object.keys(PAGES);

export function LegalPage({ slug }) {
  const page = PAGES[slug];

  useEffect(() => {
    if (page) document.title = `${page.title} | Kreomax`;
    window.scrollTo(0, 0);
  }, [page]);

  if (!page) return null;

  return (
    <div className="lp">
      <header className="lp-top">
        <div className="lp-top-inner">
          <a className="lp-brand" href="/" aria-label="Kreomax home">
            <KreomaxIcon size={30} />
            <span>KREO<b>MAX</b></span>
          </a>
          <a className="lp-back" href="/"><ArrowLeft size={16} aria-hidden="true" /> Back to Kreomax</a>
        </div>
      </header>

      <main className="lp-main">
        <h1>{page.title}</h1>
        <p className="lp-updated">{UPDATED}</p>
        {SHOW_DRAFT_NOTICE && (
          <p className="lp-draft" role="note">
            <strong>Draft for review.</strong> This page has been drafted to match how Kreomax works today. It is not legal advice.
            Have it reviewed, complete the highlighted items and then remove this notice before publishing.
          </p>
        )}
        <p className="lp-intro">{page.intro}</p>

        {page.sections.map((s) => (
          <section key={s.h} className="lp-section">
            <h2>{s.h}</h2>
            {s.p && s.p.map((t) => <p key={t}>{t}</p>)}
            {s.todo && <p className="lp-todo"><strong>To be completed:</strong> {s.todo}</p>}
          </section>
        ))}

        <section className="lp-section">
          <h2>Contact us</h2>
          <p>
            {COMPANY}, {ADDRESS}.<br />
            WhatsApp: <a href={whatsappLink('Hi Kreomax, I have a question about your policies.')} target="_blank" rel="noopener noreferrer">+{WHATSAPP_NUMBER.replace(/^91/, '91 ')}</a>
          </p>
        </section>

        <nav className="lp-links" aria-label="Policies">
          {LEGAL_SLUGS.filter((x) => x !== slug).map((x) => (
            <a key={x} href={`/${x}`}>{PAGES[x].title}</a>
          ))}
        </nav>
      </main>
    </div>
  );
}
