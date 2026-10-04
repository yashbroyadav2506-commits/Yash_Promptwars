/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DecisionInput } from '../schemas/xraySchemas.js';

export const MIN_SUBSTANTIVE_WORDS = 40;

/**
 * Counts total words across all decision fields
 */
export function countInputWords(input: DecisionInput): number {
  const combined = `${input.decisionTitle} ${input.rawDetails} ${input.rawWhyLeaning}`.trim();
  if (!combined) return 0;
  return combined.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Evaluates whether input has enough substance (>40 words) for a meaningful reasoning audit
 */
export function isInputTooThin(input: DecisionInput): { isThin: boolean; wordCount: number; needed: number } {
  const wordCount = countInputWords(input);
  return {
    isThin: wordCount < MIN_SUBSTANTIVE_WORDS,
    wordCount,
    needed: Math.max(0, MIN_SUBSTANTIVE_WORDS - wordCount)
  };
}
