import { Users, User } from 'lucide-react';

// Single source of truth for programme copy. The backend (/api/public/config) is merged on top by usePlans().
// There are no prices or online payments for now: fees are shared when a family or school enquires.
export const DEFAULT_PLANS = [
  {
    id: "cohort-24h",
    name: "Creator Cohort",
    badge: "Most Popular · 2 Months",
    duration: "24 Hours (Weekend Cohort)",
    schedule: "Sat & Sun · 1.5 hrs / session",
    tagline: "Collaborative live cohort for students (ages 12+) building real AI projects together.",
    popular: true,
    accentColor: "#7C3AED",
    icon: Users,
    deliverables: "5 Real Deliverables (Script + Art + Reel + Web + Capstone)",
    features: [
      "24 Guided Hours over 2 Months (Weekends)",
      "Live interactive build sessions across all 6 AI Studios",
      "Real Deliverables: Screenplay, Art Pack, Trailer, Website",
      "Live Peer Reviews & Class Demo Day Premiere",
      "100-Point Rubric Mentor Evaluation",
      "Kreomax Creator Certificate"
    ],
    cta: "Apply for Creator Cohort"
  },
  {
    id: "training-1on1-30h",
    name: "1:1 Creator Mentorship",
    badge: "Elite · Dedicated Mentor",
    duration: "30 Hours Personalized",
    schedule: "Flexible 1:1 Schedule (Weekdays / Weekends)",
    tagline: "Dedicated private mentoring with a senior AI specialist customized to student's pace.",
    popular: false,
    accentColor: "#6D4FD8",
    icon: User,
    deliverables: "Custom Portfolio + Advanced Audio/Video + Recommendation",
    features: [
      "30 Hours of Dedicated 1-on-1 Private Sessions",
      "Personalized Creative Track (Sci-Fi, Anime, Gaming, Web)",
      "6 Extra Deep-Dive Hours: Advanced Prompting & Audio FX",
      "Direct 1:1 Portfolio Build & Live Deployment Support",
      "Priority Capstone Grading with Personalized Video Review",
      "Official Letter of Recommendation & Creator Credential"
    ],
    cta: "Apply for 1:1 Mentorship"
  }
];
