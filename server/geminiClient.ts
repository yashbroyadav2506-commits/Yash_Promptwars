/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, XRAY_RESPONSE_SCHEMA, buildAnalysisUserPrompt } from './prompts/analysisPrompt.js';
import { DecisionInput } from '../shared/types.js';

let genAIInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[GeminiClient] WARNING: GEMINI_API_KEY is not set in environment.');
    }
    genAIInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-init' });
  }
  return genAIInstance;
}

/**
 * Execute Gemini model call with schema enforcement, retries, and backoff
 */
export async function generateXRayAudit(input: DecisionInput): Promise<any> {
  // Use deterministic mock generator during tests or when apiKey is absent/placeholder
  if (process.env.NODE_ENV === 'test' || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return generateDeterministicFallback(input);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const ai = getGenAI();
  const userPrompt = buildAnalysisUserPrompt(input);

  let lastError: Error | null = null;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: XRAY_RESPONSE_SCHEMA,
          temperature: 0.15,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini returned an empty text response.');
      }

      const parsed = JSON.parse(responseText);
      return parsed;
    } catch (err: any) {
      lastError = err;
      console.warn(`[GeminiClient] Attempt ${attempt + 1} failed:`, err?.message || err);
      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1200ms
        await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));
      }
    }
  }

  throw new Error(`Failed to generate reasoning audit after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

/**
 * Deterministic fallback audit for local dev without API key or automated testing
 */
export function generateDeterministicFallback(input: DecisionInput): any {
  const isThin = (input.rawDetails.trim().length + input.rawWhyLeaning.trim().length) < 30;
  if (isThin) {
    return {
      isThinInput: true,
      thinInputNotice: "The write-up provided is very short. Please describe the context, facts, and why you are leaning this way in more detail so BlindSpot can audit the reasoning architecture accurately.",
      claims: [],
      attentionMap: [],
      hiddenAssumptions: [],
      internalConflicts: [],
      perspectiveLenses: {
        futureSelfLens: { sixMonths: "", fiveYears: "" },
        preMortemLens: { scenarioDescription: "", vulnerablePoints: [], diagnosticQuestion: "" },
        outsiderLens: { affectedStakeholder: "", probingQuestion: "" },
        oppositeSteelmanLens: { counterOptionName: "", steelmanCase: "", criticalQuestion: "" }
      },
      questionsToSitWith: []
    };
  }

  return {
    isThinInput: false,
    thinInputNotice: "",
    claims: [
      {
        id: "c-1",
        type: "FACT",
        quote: "stipend and is located a 20-minute bus ride",
        statement: "The position pays a specific stipend and involves a 20-minute bus commute.",
        epistemicNote: "Concrete, measurable parameters that can be verified immediately."
      },
      {
        id: "c-2",
        type: "FACT",
        quote: "no full-time senior designer (I would be the sole designer report directly to the CEO)",
        statement: "There is no in-house design mentor, and the role reports directly to the executive founder.",
        epistemicNote: "Organizational structure verified by the offer terms."
      },
      {
        id: "c-3",
        type: "ASSUMPTION",
        quote: "will make getting a full-time job much easier when I graduate",
        statement: "Any startup experience directly accelerates post-graduation hiring regardless of project depth.",
        epistemicNote: "Unverified belief about future recruiter evaluation patterns."
      },
      {
        id: "c-4",
        type: "VALUE/PREFERENCE",
        quote: "help pay down my student card debt immediately",
        statement: "Immediate financial relief and debt reduction is a high immediate priority.",
        epistemicNote: "Expresses a subjective financial goal and preference."
      },
      {
        id: "c-5",
        type: "PREDICTION",
        quote: "startups move fast and everyone knows startup experience looks impressive",
        statement: "Working in this fast-paced startup will generate recognizable prestige in the broader job market.",
        epistemicNote: "Uncertain speculative outcome regarding third-party perception."
      }
    ],
    attentionMap: [
      {
        id: "dim-fin",
        name: "Financial & Compensation",
        description: "Immediate cash, expenses, debt, long-term earning potential",
        airtime: 35,
        likelyWeight: 45,
        isGap: false,
        gapRationale: "Financial aspects are well represented in the current text.",
        suggestedInquiry: "How would your financial trajectory change if you delayed debt payoff by 4 months?"
      },
      {
        id: "dim-learn",
        name: "Skill Mastery & True Learning",
        description: "Mentorship quality, depth of craft, learning curve vs repetitive grunt work",
        airtime: 8,
        likelyWeight: 88,
        isGap: true,
        gapRationale: "You cited learning as a major hope, but spent under 10% of your write-up examining mentorship or daily design feedback.",
        suggestedInquiry: "Without a senior designer on staff, who will review your design systems and critique your work when you get stuck?"
      },
      {
        id: "dim-acad",
        name: "Academic & Formal Milestones",
        description: "Degree progression, graduation timeline, credits, and formal requirements",
        airtime: 12,
        likelyWeight: 80,
        isGap: true,
        gapRationale: "Postponing graduation by a semester carries delayed earnings and altered peer cohorts that received minimal focus.",
        suggestedInquiry: "What are the second-order effects of pushing graduation from autumn to spring on upcoming hiring cycles?"
      },
      {
        id: "dim-time",
        name: "Time, Energy & Bandwidth",
        description: "Hours, commute, rest, burnout risk, and daily routine sustainability",
        airtime: 25,
        likelyWeight: 50,
        isGap: false,
        gapRationale: "Commute and weekly hours were acknowledged directly.",
        suggestedInquiry: "What is your energy reserve plan when 40 hours of solo startup design collides with coursework requirements?"
      },
      {
        id: "dim-rev",
        name: "Exit Costs & Reversibility",
        description: "Ability to undo the decision, penalty for leaving, backup plans",
        airtime: 0,
        likelyWeight: 75,
        isGap: true,
        gapRationale: "Zero words were spent on exit clauses, probation periods, or what happens if the startup pivots or cuts the role.",
        suggestedInquiry: "If the role turns out to be 80% pitch deck production instead of product design after 60 days, what is your cost to exit?"
      },
      {
        id: "dim-opp",
        name: "Opportunity Cost & Alternative Paths",
        description: "Other offers, summer research, capstone projects forfeited",
        airtime: 5,
        likelyWeight: 70,
        isGap: true,
        gapRationale: "What options are permanently foreclosed by committing 6 months to this specific path right now?",
        suggestedInquiry: "What alternative high-learning experiences or projects will you not be able to pursue over these 6 months?"
      },
      {
        id: "dim-health",
        name: "Physical & Mental Well-being",
        description: "Stress levels, sleep quality, autonomy, psychological safety",
        airtime: 5,
        likelyWeight: 65,
        isGap: true,
        gapRationale: "Being the sole designer reporting directly to an early-stage founder often carries high pressure with low psychological buffers.",
        suggestedInquiry: "How well equipped do you feel to push back against executive demands when design requirements conflict?"
      }
    ],
    hiddenAssumptions: [
      {
        id: "ha-1",
        statement: "Being the sole designer at a startup yields better growth than having an experienced senior design mentor elsewhere.",
        sourceQuote: "no full-time senior designer (I would be the sole designer report directly to the CEO)",
        vulnerability: "Without senior critique, one can easily reinforce amateur design habits and spend months inventing solutions already solved by industry standards.",
        cheapestTest: "Message an alumnus who was a solo student intern on LinkedIn and ask: 'What percentage of your work received actionable design critique versus founder whim?'"
      },
      {
        id: "ha-2",
        statement: "Future hiring managers universally value early startup titles over deep portfolio craft.",
        sourceQuote: "everyone knows startup experience looks impressive",
        vulnerability: "Many hiring managers value rigorous process, rationale, and teamwork over unsupported startup logos.",
        cheapestTest: "Ask two senior design leads on ADPList for 10 minutes to review a sample resume with solo-internship experience versus portfolio case studies."
      },
      {
        id: "ha-3",
        statement: "A seed-stage startup with 12 pilot customers will have stable product design needs for the full 6 months.",
        sourceQuote: "B2B logistics dashboard with 12 pilot customers",
        vulnerability: "Seed-stage startups frequently pivot product focus rapidly, sometimes transitioning interns to sales collateral or basic ops.",
        cheapestTest: "Ask the CEO: 'What specific design milestones must be shipped in weeks 1-8 versus months 3-6?'"
      }
    ],
    internalConflicts: [
      {
        id: "ic-1",
        valueQuote: "real 'industry experience' on my resume instead of just classroom projects",
        reasonQuote: "stipend is great ... super close to home so I won't waste time commuting",
        tensionAnalysis: "While you emphasize professional skill development as the primary objective, your primary decision drivers are geographical convenience and immediate cash compensation.",
        inquiry: "If the identical role were 50 minutes away with $1,000 less stipend, would the pure learning value still justify deferring graduation?"
      }
    ],
    perspectiveLenses: {
      futureSelfLens: {
        sixMonths: "At the end of the 6 months, you have completed the internship and postponed graduation. Looking back at your portfolio, how many shipped case studies demonstrate verifiable craft vs hurried compromises?",
        fiveYears: "Five years into your career, will the semester delay in graduation matter at all, or will the foundation of your initial design habits dominate?"
      },
      preMortemLens: {
        scenarioDescription: "Imagine it is month 5: you feel exhausted, the product pivoted twice, and you are building marketing banners instead of UX systems.",
        vulnerablePoints: [
          "Lack of in-house design leadership to protect product integrity",
          "Founder pressure overriding user testing methodologies",
          "Academic stress from deferred requirements looming next spring"
        ],
        diagnosticQuestion: "What guardrail could you establish in the offer letter before day 1 to prevent being diverted away from product UX?"
      },
      outsiderLens: {
        affectedStakeholder: "A future senior design hiring manager reviewing your portfolio in two years.",
        probingQuestion: "What specific evidence in your design artifacts will prove you learned rigorous user-centered methodology rather than simply executing founder commands?"
      },
      oppositeSteelmanLens: {
        counterOptionName: "Completing senior classes on schedule and seeking a structured summer internship or research lab",
        steelmanCase: "Graduating on time maintains academic momentum, preserves your cohort network, and allows you to target formal associate programs with dedicated senior mentors and structured career paths.",
        criticalQuestion: "What if the highest-leverage long-term move is protecting graduation timing while building a world-class capstone portfolio?"
      }
    },
    questionsToSitWith: [
      "What is the single most important skill you need to acquire this year, and what objective evidence guarantees this role teaches it?",
      "Who will mentor you when your design intuition collides with the CEO's personal preferences?",
      "If the startup runs out of runway or changes direction in month 3, what is your exit posture?",
      "How does postponing graduation impact your access to campus career fairs and on-campus recruiting pipelines?",
      "What does 'industry experience' mean to you in concrete daily deliverables rather than resume keywords?",
      "What conversation with the founders would change your mind about accepting this offer?"
    ]
  };
}
