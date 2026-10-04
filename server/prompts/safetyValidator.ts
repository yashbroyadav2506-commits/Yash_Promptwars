/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CRISIS_HOTLINES } from '../../shared/constants.js';
import { CrisisDetectionResult } from '../../shared/types.js';

// Fast regex patterns for immediate crisis detection
const CRISIS_PATTERNS = [
  /\b(kill\s+(myself|me)|suicid(e|al)|end\s+my\s+life|want\s+to\s+die|hang\s+myself)\b/i,
  /\b(self[-\s]?harm|cut\s+my\s+wrists|overdose|take\s+all\s+my\s+pills)\b/i,
  /\b(no\s+reason\s+to\s+live|better\s+off\s+dead|can't\s+go\s+on\s+living)\b/i,
  /\b(physically\s+abusing\s+me|beating\s+me\s+up|in\s+immediate\s+danger)\b/i
];

export function evaluateCrisisSafety(text: string): CrisisDetectionResult {
  const combinedText = text.toLowerCase();
  const matched: string[] = [];

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(combinedText)) {
      matched.push(pattern.source);
    }
  }

  if (matched.length > 0) {
    return {
      isCrisis: true,
      detectedTopics: matched,
      supportMessage: 
        "It sounds like you may be going through an overwhelming or painful situation. " +
        "BlindSpot is designed for structured decision analysis and is not equipped to support personal crises. " +
        "Please connect with compassionate, trained professionals or someone you trust right now.",
      hotlineResources: CRISIS_HOTLINES
    };
  }

  return {
    isCrisis: false,
    detectedTopics: [],
    supportMessage: "",
    hotlineResources: []
  };
}
