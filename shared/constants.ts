/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DecisionInput } from './types.js';

export const DEMO_SCENARIO: DecisionInput = {
  decisionTitle: "Should I accept a 6-month product design internship at a 20-person seed-stage startup?",
  rawDetails: 
`The startup offers a $3,500/month stipend and is located a 20-minute bus ride from my apartment. 
The team expects 40 hours per week in person. They have two founders and four junior engineers, but no full-time senior designer (I would be the sole designer report directly to the CEO).
My college allows credit for full-time internships, but I would need to defer two required senior seminar courses to next spring, postponing graduation by one semester. 
The product is a B2B logistics dashboard with 12 pilot customers.`,
  rawWhyLeaning: 
`I'm leaning heavily toward accepting. The stipend is great for a student and will help pay down my student card debt immediately. 
It's super close to home so I won't waste time commuting. 
Most importantly, it will give me real 'industry experience' on my resume instead of just classroom projects, which will make getting a full-time job much easier when I graduate. 
Besides, startups move fast and everyone knows startup experience looks impressive.`,
  reversibility: "costly",
  timeHorizon: "6-12 months",
};

export const STANDARD_DIMENSIONS = [
  { id: 'financial', name: 'Financial & Compensation', description: 'Immediate cash, expenses, debt, long-term earning potential' },
  { id: 'time_energy', name: 'Time, Energy & Bandwidth', description: 'Hours, commute, rest, burnout risk, and daily routine sustainability' },
  { id: 'learning_growth', name: 'Skill Mastery & True Learning', description: 'Mentorship quality, depth of craft, learning curve vs repetitive grunt work' },
  { id: 'academic_milestones', name: 'Academic & Formal Milestones', description: 'Degree progression, graduation timeline, credits, and formal requirements' },
  { id: 'long_term_trajectory', name: 'Long-Term Trajectory & Options', description: 'Doors opened vs closed, brand signal vs substance, career compounding' },
  { id: 'reversibility', name: 'Exit Costs & Reversibility', description: 'Ability to undo the decision, penalty for leaving, backup plans' },
  { id: 'relationships_community', name: 'Relationships & Social Life', description: 'Campus friendships, peer cohorts, family presence, isolation' },
  { id: 'opportunity_cost', name: 'Opportunity Cost & Alternative Paths', description: 'Other offers, summer research, capstone projects forfeited' },
  { id: 'health_wellbeing', name: 'Physical & Mental Well-being', description: 'Stress levels, sleep quality, autonomy, psychological safety' },
] as const;

export const CRISIS_HOTLINES = [
  {
    name: "988 Suicide & Crisis Lifeline (US/Canada)",
    contact: "Dial or Text 988 (Available 24/7, free and confidential)",
    description: "Support for anyone in distress, prevention, and crisis intervention."
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    description: "Connect with a crisis counselor 24/7 over SMS."
  },
  {
    name: "Befrienders Worldwide (International)",
    contact: "https://www.befrienders.org",
    description: "Find confidential emotional support services across 32+ countries."
  },
  {
    name: "The Trevor Project (LGBTQ youth)",
    contact: "Call 1-866-488-7386 or Text START to 678-678",
    description: "Free, confidential 24/7 suicide prevention and crisis counseling."
  }
];
