/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { validateDirectiveLanguage, sanitizeDirectiveText } from '../server/prompts/directiveValidator.js';
import { XRayAnalysis } from '../shared/types.js';

describe('Directive Language Guardrail Validator', () => {
  const createMockAnalysis = (overrides: Partial<XRayAnalysis> = {}): XRayAnalysis => ({
    id: 'test-1',
    createdAt: new Date().toISOString(),
    decisionTitle: 'Test decision',
    rawDetails: 'Sample details',
    rawWhyLeaning: 'Sample leaning',
    reversibility: 'costly',
    timeHorizon: '6-12 months',
    isThinInput: false,
    guardrailPassed: true,
    secondPassValidated: true,
    claims: [
      { id: '1', type: 'FACT', quote: 'test', statement: 'Objective statement.' }
    ],
    attentionMap: [
      {
        id: 'fin',
        name: 'Finance',
        description: 'Money',
        airtime: 10,
        likelyWeight: 70,
        isGap: true,
        gapRationale: 'Financial impact is significant.',
        suggestedInquiry: 'How would your savings buffer hold up?'
      }
    ],
    hiddenAssumptions: [
      {
        id: 'h1',
        statement: 'The market will stay stable.',
        vulnerability: 'Markets fluctuate.',
        cheapestTest: 'Review 3 years of historic trends.'
      }
    ],
    internalConflicts: [],
    perspectiveLenses: {
      futureSelfLens: { sixMonths: 'Looking back after 6 months.', fiveYears: 'Looking back after 5 years.' },
      preMortemLens: { scenarioDescription: 'It failed.', vulnerablePoints: ['Stress'], diagnosticQuestion: 'What broke?' },
      outsiderLens: { affectedStakeholder: 'Partner', probingQuestion: 'How does this affect shared time?' },
      oppositeSteelmanLens: { counterOptionName: 'Option B', steelmanCase: 'Option B provides stability.', criticalQuestion: 'Can stability be achieved?' }
    },
    questionsToSitWith: [
      'What tradeoff are you most willing to accept?',
      'How does this align with your multi-year priorities?'
    ],
    stats: {
      totalWords: 50,
      claimCounts: { FACT: 1, ASSUMPTION: 0, 'VALUE/PREFERENCE': 0, PREDICTION: 0 },
      majorGapsCount: 1,
      untestedAssumptionsCount: 1
    },
    ...overrides
  });

  it('passes cleanly for non-directive, open-ended reasoning outputs', () => {
    const cleanAnalysis = createMockAnalysis();
    const result = validateDirectiveLanguage(cleanAnalysis);
    expect(result.isValid).toBe(true);
    expect(result.detectedViolations.length).toBe(0);
  });

  it('catches "you should" directive phrasing', () => {
    const badAnalysis = createMockAnalysis({
      questionsToSitWith: ['You should definitely take the job offer.']
    });
    const result = validateDirectiveLanguage(badAnalysis);
    expect(result.isValid).toBe(false);
    expect(result.detectedViolations[0].toLowerCase()).toContain('you should');
  });

  it('catches "the best choice" or "the right decision" assertions', () => {
    const badAnalysis = createMockAnalysis({
      hiddenAssumptions: [
        {
          id: 'h1',
          statement: 'Staying is the best choice for you.',
          vulnerability: 'Uncertain',
          cheapestTest: 'Ask colleagues'
        }
      ]
    });
    const result = validateDirectiveLanguage(badAnalysis);
    expect(result.isValid).toBe(false);
    expect(result.detectedViolations[0].toLowerCase()).toContain('the best choice');
  });

  it('catches "I recommend" phrases', () => {
    const badAnalysis = createMockAnalysis({
      perspectiveLenses: {
        ...createMockAnalysis().perspectiveLenses,
        oppositeSteelmanLens: {
          counterOptionName: 'Option B',
          steelmanCase: 'I recommend choosing this path over the other.',
          criticalQuestion: 'Why not?'
        }
      }
    });
    const result = validateDirectiveLanguage(badAnalysis);
    expect(result.isValid).toBe(false);
    expect(result.detectedViolations[0].toLowerCase()).toContain('i recommend');
  });

  it('sanitizes mild directive language cleanly', () => {
    const sanitized = sanitizeDirectiveText('You should consider testing this assumption.');
    expect(sanitized).not.toContain('You should consider');
    expect(sanitized).toContain('one might examine');
  });
});
