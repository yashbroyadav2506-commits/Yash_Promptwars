/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DirectiveValidationResult, XRayAnalysis } from '../../shared/types.js';

// Directive patterns strictly forbidden in BlindSpot outputs
const DIRECTIVE_PATTERNS = [
  /\b(you\s+(must|should|ought\s+to|have\s+to|need\s+to\s+pick|need\s+to\s+choose))\b/i,
  /\b(i\s+(recommend|advise|urge|suggest\s+you\s+(take|choose|pick)))\b/i,
  /\b(the\s+(best|right|correct|ideal|optimal|superior|winning)\s+(choice|option|path|decision|way))\b/i,
  /\b(you('d| would)\s+be\s+(better\s+off|foolish\s+not\s+to))\b/i,
  /\b(definitely\s+(go\s+with|accept|reject|choose|turn\s+down))\b/i,
  /\b(my\s+verdict|the\s+winner\s+is|final\s+recommendation)\b/i
];

export function validateDirectiveLanguage(analysis: XRayAnalysis): DirectiveValidationResult {
  const violations: string[] = [];

  // Extract all output texts to scan
  const textsToScan: string[] = [
    ...analysis.claims.map(c => `${c.statement} ${c.epistemicNote || ''}`),
    ...analysis.attentionMap.map(a => `${a.gapRationale} ${a.suggestedInquiry}`),
    ...analysis.hiddenAssumptions.map(h => `${h.statement} ${h.vulnerability} ${h.cheapestTest}`),
    ...analysis.internalConflicts.map(i => `${i.tensionAnalysis} ${i.inquiry}`),
    analysis.perspectiveLenses.futureSelfLens.sixMonths,
    analysis.perspectiveLenses.futureSelfLens.fiveYears,
    analysis.perspectiveLenses.preMortemLens.scenarioDescription,
    analysis.perspectiveLenses.preMortemLens.diagnosticQuestion,
    analysis.perspectiveLenses.outsiderLens.probingQuestion,
    analysis.perspectiveLenses.oppositeSteelmanLens.steelmanCase,
    analysis.perspectiveLenses.oppositeSteelmanLens.criticalQuestion,
    ...analysis.questionsToSitWith
  ];

  for (const text of textsToScan) {
    for (const pattern of DIRECTIVE_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        violations.push(`Found directive phrase "${match[0]}" in: "${text.substring(0, 80)}..."`);
      }
    }
  }

  return {
    isValid: violations.length === 0,
    detectedViolations: violations
  };
}

/**
 * Sanitizes mild stray directive phrases if detected
 */
export function sanitizeDirectiveText(text: string): string {
  return text
    .replace(/\byou should consider\b/gi, 'one might examine')
    .replace(/\byou should\b/gi, 'it may be worth exploring whether to')
    .replace(/\byou must\b/gi, 'one could verify how to')
    .replace(/\bthe best option\b/gi, 'this perspective')
    .replace(/\bi recommend\b/gi, 'one inquiry is');
}
