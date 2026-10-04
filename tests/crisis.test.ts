/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { evaluateCrisisSafety } from '../server/prompts/safetyValidator.js';

describe('Crisis & Safety Evaluation Guardrail', () => {
  it('identifies self-harm or suicidal ideation and interrupts analysis', () => {
    const text = "I am so overwhelmed by whether to drop out that I want to kill myself.";
    const result = evaluateCrisisSafety(text);

    expect(result.isCrisis).toBe(true);
    expect(result.hotlineResources.length).toBeGreaterThan(0);
    expect(result.supportMessage).toContain('BlindSpot is designed for structured decision analysis and is not equipped to support personal crises');
  });

  it('identifies abuse or acute physical danger', () => {
    const text = "My partner is physically abusing me and I don't know whether to leave tonight or tomorrow.";
    const result = evaluateCrisisSafety(text);

    expect(result.isCrisis).toBe(true);
    expect(result.hotlineResources.length).toBeGreaterThan(0);
  });

  it('allows normal high-stakes decisions through without false positives', () => {
    const normalTexts = [
      "I'm worried this job offer will kill my free time on weekends.",
      "Should I accept this internship in New York or stay in Chicago?",
      "Deciding between taking a medical sabbatical or pushing through my senior year."
    ];

    for (const text of normalTexts) {
      const result = evaluateCrisisSafety(text);
      expect(result.isCrisis).toBe(false);
      expect(result.hotlineResources.length).toBe(0);
    }
  });
});
