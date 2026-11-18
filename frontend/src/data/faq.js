// Questions for the "Ask your Kreomax buddy" section, grouped by who is asking.
// Keep answers short, factual and in line with the product as it works today.
// `link` (optional) adds a follow-up link to the answer.

export const FAQ_GROUPS = [
  {
    id: 'parents',
    label: 'Parents',
    greeting: 'Hi! I am your Kreomax buddy. Parents often ask me these. Tap a question.',
    items: [
      {
        q: 'Who is Kreomax for?',
        a: 'Students aged 12 and above, typically Grades 8 to 12. Schools can also run it for a class, club or innovation lab.',
      },
      {
        q: 'Does my child need any experience?',
        a: 'No. Every level is guided step by step, one hour at a time, so a complete beginner can start from zero.',
      },
      {
        q: 'What will my child make?',
        a: 'A screenplay, a research guide, concept art, a 32-second video trailer, a live website and a rubric-graded certificate.',
      },
      {
        q: 'How long does it take?',
        a: 'The course is 24 guided hours across six levels. The Creator Cohort runs on weekends (Saturday and Sunday, 1.5 hours per session) over about two months. 1:1 Mentorship is 30 hours on a flexible schedule.',
      },
      {
        q: 'What do we need at home?',
        a: 'A laptop or desktop computer with a modern web browser and an internet connection.',
      },
      {
        q: 'How is my child\'s data handled?',
        a: 'We only collect what is needed to run the programme, and we ask that a parent or guardian submits or approves enrolment details for students under 18.',
        link: { href: '/privacy', label: 'Read the Privacy Policy' },
      },
      {
        q: 'How much does it cost?',
        a: 'The intro class is ₹199. For the programmes, fee details and upcoming batch dates are shared when you enquire. There is no online payment on this website.',
      },
    ],
  },
  {
    id: 'students',
    label: 'Students',
    greeting: 'Hey creator! Here is what students ask me most. Pick one.',
    items: [
      {
        q: 'Do I have to be good at tech?',
        a: 'Not at all. You learn each tool as you go, one hour at a time, and a mentor guide is always one tap away.',
      },
      {
        q: 'Can I choose my own story?',
        a: 'Yes. Pick one of the example worlds or write your own, and the whole project, from screenplay to website, is built around it.',
      },
      {
        q: 'Does the AI do the work for me?',
        a: 'No. AI is your co-pilot. You make the decisions: the story, the style, the camera moves. You also check its facts and sources, which is part of the course.',
      },
      {
        q: 'What will I have at the end?',
        a: 'A finished portfolio you can show people: a screenplay, research, concept art, a trailer and a live website, plus your certificate.',
      },
      {
        q: 'How do I earn the certificate?',
        a: 'Complete all 24 hours across the six levels. The certificate unlocks on the Final Project screen once every hour is done.',
      },
    ],
  },
  {
    id: 'schools',
    label: 'Schools',
    greeting: 'Hello! Here is what schools usually want to know. Tap a question.',
    items: [
      {
        q: 'Can our school run Kreomax?',
        a: 'Yes. It works as a programme for a class, club or innovation lab. Message us and we will share an outline for your class size and timetable.',
      },
      {
        q: 'What do teachers get?',
        a: 'A trainer guide for facilitators, student progress tracking and rubric-based evaluation for the final project.',
      },
      {
        q: 'What do students walk away with?',
        a: 'Portfolio outputs they can present: a story, research, concept art, a trailer and a website, and a certificate when they finish.',
      },
      {
        q: 'What do we need in the classroom?',
        a: 'A laptop or desktop for each student (or pair) with a modern web browser and an internet connection.',
      },
      {
        q: 'How do we get started?',
        a: 'Send us a message on WhatsApp with your school name, grade levels and rough class size, and we will take it from there.',
        cta: 'whatsapp-school',
      },
    ],
  },
];
