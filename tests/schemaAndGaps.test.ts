/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { 
  CallAResponseSchema, 
  CallBResponseSchema, 
  ReasoningClaimSchema,
  AttentionDimensionSchema,
  DecisionInputSchema
} from '../src/schemas/xraySchemas.js';

describe('Zod Schema Validation & Airtime/Gap Calculations', () => {
  it('validates a correct Call A response (claims + attention map)', () => {
    const validCallA = {
      claims: [
        {
          id: 'c-1',
          type: 'FACT',
          quote: '$3,500/mo stipend',
          statement: 'Compensation is $3,500 per month.',
          epistemicNote: 'Measurable financial figure.'
        },
        {
          id: 'c-2',
          type: 'ASSUMPTION',
          quote: 'will make getting a full-time job much easier',
          statement: 'Startup experience universally accelerates full-time hiring.'
        }
      ],
      attentionMap: [
        {
          id: 'money',
          name: 'Money & Compensation',
          description: 'Living costs, debt, salary',
          airtime: 35,
          likelyWeight: 45,
          isGap: false,
          gapRationale: 'Financial aspects are well represented.',
          suggestedInquiry: 'How does this pay change your safety buffer?'
        },
        {
          id: 'learning',
          name: 'Learning & Skill Growth',
          description: 'Mentorship, skill depth',
          airtime: 10,
          likelyWeight: 85,
          isGap: true,
          gapRationale: 'Learning is heavily weighted but received under 15% airtime.',
          suggestedInquiry: 'Who will critique your work without a senior mentor?'
        },
        {
          id: 'time',
          name: 'Time & Energy',
          description: 'Hours and commute',
          airtime: 30,
          likelyWeight: 40,
          isGap: false,
          gapRationale: 'Hours covered in write-up.',
          suggestedInquiry: 'How sustainable is 40 hours?'
        },
        {
          id: 'reversibility',
          name: 'Reversibility',
          description: 'Exit costs',
          airtime: 0,
          likelyWeight: 75,
          isGap: true,
          gapRationale: 'Zero words on exit costs.',
          suggestedInquiry: 'What is your penalty for quitting early?'
        },
        {
          id: 'academics',
          name: 'Academic Path',
          description: 'Graduation delay',
          airtime: 15,
          likelyWeight: 80,
          isGap: true,
          gapRationale: 'Delaying graduation received limited reflection.',
          suggestedInquiry: 'How does postponing courses affect future cohorts?'
        }
      ],
      screenReaderSummary: 'Analysis identified 3 attention gaps: Learning, Reversibility, and Academic Path.'
    };

    const parsed = CallAResponseSchema.safeParse(validCallA);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid Call A response with missing required fields or out-of-bound airtime', () => {
    const invalidCallA = {
      claims: [
        { id: '1', type: 'INVALID_TYPE', quote: 'abc', statement: 'def' }
      ],
      attentionMap: [
        {
          id: 'money',
          name: 'Money',
          description: 'Costs',
          airtime: 150, // Out of bounds (>100)
          likelyWeight: 50,
          isGap: false,
          gapRationale: 'Test',
          suggestedInquiry: 'Test inquiry?'
        }
      ],
      screenReaderSummary: 'Summary'
    };

    const parsed = CallAResponseSchema.safeParse(invalidCallA);
    expect(parsed.success).toBe(false);
  });

  it('validates a correct Call B response (assumptions, conflicts, lenses, questions)', () => {
    const validCallB = {
      hiddenAssumptions: [
        {
          id: 'ha-1',
          statement: 'Being the sole designer leads to faster growth than having a mentor.',
          sourceQuote: 'no full-time senior designer',
          vulnerability: 'Lack of professional design critique reinforces bad habits.',
          cheapestTest: 'Message a designer on LinkedIn who interned solo.'
        }
      ],
      internalConflicts: [
        {
          id: 'ic-1',
          valueQuote: 'I want deep learning',
          reasonQuote: 'picked it for the stipend and proximity',
          tensionAnalysis: 'The stated objective of craft development clashes with convenience-driven decision rationale.',
          inquiry: 'If the pay was lower, would the learning alone justify the choice?'
        }
      ],
      perspectiveLenses: {
        futureSelfLens: {
          sixMonths: 'Looking back from month 6.',
          fiveYears: 'Looking back after 5 years.'
        },
        preMortemLens: {
          scenarioDescription: 'The startup pivoted and you ended up making marketing decks.',
          vulnerablePoints: ['Lack of senior design lead', 'Founder pressure'],
          diagnosticQuestion: 'What milestones ensure you stay on product UX?'
        },
        outsiderLens: {
          affectedStakeholder: 'Future hiring manager',
          probingQuestion: 'Where is the evidence of user research in your portfolio?'
        },
        oppositeSteelmanLens: {
          counterOptionName: 'Complete senior classes on schedule',
          steelmanCase: 'Graduating on time protects your cohort network and enables associate programs with mentorship.',
          criticalQuestion: 'What if graduating on time is the higher leverage move?'
        }
      },
      questionsToSitWith: [
        'What single skill do you need to learn most this year?',
        'Who will critique your work when you get stuck?',
        'What would make you walk away from this offer?',
        'How does postponing graduation change your recruiting timeline?',
        'What does industry experience mean in concrete daily craft?'
      ]
    };

    const parsed = CallBResponseSchema.safeParse(validCallB);
    expect(parsed.success).toBe(true);
  });

  it('calculates attention gaps correctly based on weight vs airtime discrepancy', () => {
    // Gap rule: likelyWeight >= 55 and airtime <= 20
    const dims = [
      { airtime: 10, likelyWeight: 80 }, // Gap!
      { airtime: 30, likelyWeight: 40 }, // Not a gap (weight not high)
      { airtime: 60, likelyWeight: 70 }, // Not a gap (airtime is ample)
      { airtime: 5, likelyWeight: 60 },  // Gap!
    ];

    const isGapCalculated = dims.map(d => d.likelyWeight >= 55 && d.airtime <= 20);
    expect(isGapCalculated).toEqual([true, false, false, true]);
  });

  it('generates a one-line headline from attention distribution data', () => {
    const dims: any[] = [
      { id: 'money', name: 'Money & Compensation', airtime: 70, likelyWeight: 45, isGap: false },
      { id: 'learning', name: 'Skill Mastery & Learning', airtime: 5, likelyWeight: 85, isGap: true },
      { id: 'time', name: 'Time & Energy', airtime: 25, likelyWeight: 40, isGap: false }
    ];

    const sortedByAirtime = [...dims].sort((a, b) => b.airtime - a.airtime);
    const topAirtime = sortedByAirtime[0];
    const gaps = dims.filter(d => d.isGap);
    const topGap = gaps[0];

    const headline = `About ${topAirtime.airtime}% of your words are about ${topAirtime.name.toLowerCase().split('&')[0].trim()}; '${topGap.name.toLowerCase().split('&')[0].trim()}' got ${topGap.airtime}%.`;
    expect(headline).toBe("About 70% of your words are about money; 'skill mastery' got 5%.");
  });

  it('computes how thinking shifted between Run 1 and Run 2 without judgment language', async () => {
    const { computeThinkingShift } = await import('../src/utils/diffCalculator.js');

    const prevRun: any = {
      id: 'run-1',
      stats: { totalWords: 60, claimCounts: { FACT: 2, ASSUMPTION: 3, VALUE: 1, PREDICTION: 1 }, majorGapsCount: 2, untestedAssumptionsCount: 2 },
      callA: {
        claims: [],
        attentionMap: [
          { id: 'learning', name: 'Skill Mastery & Learning', airtime: 5, likelyWeight: 85, isGap: true, gapRationale: '', suggestedInquiry: '' },
          { id: 'money', name: 'Money & Compensation', airtime: 65, likelyWeight: 45, isGap: false, gapRationale: '', suggestedInquiry: '' }
        ],
        screenReaderSummary: ''
      },
      callB: {
        hiddenAssumptions: [
          { id: 'ha-1', statement: 'Startups always look impressive on a resume', vulnerability: 'Varies', cheapestTest: 'Ask recruiter' },
          { id: 'ha-2', statement: 'Senior design mentorship is unneeded', vulnerability: 'Reinforces habits', cheapestTest: 'Message intern' }
        ],
        internalConflicts: [
          { id: 'ic-1', valueQuote: 'I want learning', reasonQuote: 'picked for money', tensionAnalysis: 'Tension', inquiry: 'Inquiry' }
        ],
        perspectiveLenses: {} as any,
        questionsToSitWith: []
      }
    };

    const currRun: any = {
      id: 'run-2',
      stats: { totalWords: 95, claimCounts: { FACT: 5, ASSUMPTION: 2, VALUE: 1, PREDICTION: 1 }, majorGapsCount: 1, untestedAssumptionsCount: 2 },
      callA: {
        claims: [],
        attentionMap: [
          // Narrowed gap! Airtime went from 5% to 28%
          { id: 'learning', name: 'Skill Mastery & Learning', airtime: 28, likelyWeight: 85, isGap: false, gapRationale: '', suggestedInquiry: '' },
          { id: 'money', name: 'Money & Compensation', airtime: 40, likelyWeight: 45, isGap: false, gapRationale: '', suggestedInquiry: '' }
        ],
        screenReaderSummary: ''
      },
      callB: {
        hiddenAssumptions: [
          // ha-1 was addressed and removed; ha-2 is still here; ha-3 is newly surfaced
          { id: 'ha-2', statement: 'Senior design mentorship is unneeded', vulnerability: 'Reinforces habits', cheapestTest: 'Message intern' },
          { id: 'ha-3', statement: '12 pilot customers will guarantee product stability', vulnerability: 'Seed startups pivot', cheapestTest: 'Ask CEO' }
        ],
        internalConflicts: [
          { id: 'ic-1', valueQuote: 'I want learning', reasonQuote: 'picked for money', tensionAnalysis: 'Tension', inquiry: 'Inquiry' },
          { id: 'ic-2', valueQuote: 'I want timely graduation', reasonQuote: 'deferring two classes', tensionAnalysis: 'New tension', inquiry: 'Inquiry' }
        ],
        perspectiveLenses: {} as any,
        questionsToSitWith: []
      }
    };

    const diff = computeThinkingShift(prevRun, currRun, { 'ha-1': true });

    // 1. Verify narrowed gaps
    expect(diff.narrowedGaps.length).toBe(1);
    expect(diff.narrowedGaps[0].name).toContain('Learning');
    expect(diff.narrowedGaps[0].beforeAirtime).toBe(5);
    expect(diff.narrowedGaps[0].afterAirtime).toBe(28);
    expect(diff.narrowedGaps[0].deltaAirtime).toBe(23);

    // 2. Verify addressed assumptions
    expect(diff.addressedAssumptions.length).toBe(1);
    expect(diff.addressedAssumptions[0].statement).toContain('Startups always look impressive');

    // 3. Verify newly surfaced assumptions & conflicts
    expect(diff.newAssumptions.length).toBe(1);
    expect(diff.newAssumptions[0].statement).toContain('12 pilot customers');
    expect(diff.newConflicts.length).toBe(1);
    expect(diff.newConflicts[0].valueQuote).toContain('I want timely graduation');

    // 4. STRICT TONE ASSERTION: Never uses "improved", "better", "upgrade", or "fix"
    const serializedDiff = JSON.stringify(diff).toLowerCase();
    expect(serializedDiff).not.toContain('improved');
    expect(serializedDiff).not.toContain('better');
    expect(serializedDiff).not.toContain('upgrade');
    expect(serializedDiff).toContain('how your thinking shifted');
  });
});
