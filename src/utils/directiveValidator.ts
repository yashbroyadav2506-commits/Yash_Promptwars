/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DirectiveCheckResult {
  isValid: boolean;
  violations: string[];
}

/**
 * Strict regex rules identifying directive, advisory, or option-ranking language
 */
export const DIRECTIVE_PATTERNS: RegExp[] = [
  /\b(you\s+(must|should|ought\s+to|have\s+to|need\s+to\s+pick|need\s+to\s+choose))\b/i,
  /\b(i\s+(recommend|advise|urge|suggest\s+you\s+(take|choose|pick)))\b/i,
  /\b(we\s+(recommend|advise|suggest))\b/i,
  /\b(the\s+(best|right|correct|ideal|optimal|superior|winning)\s+(choice|option|path|decision|way))\b/i,
  /\b(you('d| would)\s+be\s+(better\s+off|foolish\s+not\s+to))\b/i,
  /\b(go\s+with\s+(option|path|the))\b/i,
  /\b(definitely\s+(go\s+with|accept|reject|choose|turn\s+down))\b/i,
  /\b(my\s+verdict|the\s+winner\s+is|final\s+recommendation)\b/i
];

/**
 * Validates any string or nested object of strings for directive language
 */
export function checkDirectiveLanguage(target: any): DirectiveCheckResult {
  const violations: string[] = [];

  function scan(val: any) {
    if (typeof val === 'string') {
      for (const pattern of DIRECTIVE_PATTERNS) {
        const match = val.match(pattern);
        if (match) {
          violations.push(`Directive pattern found "${match[0]}" in "${val.substring(0, 90)}..."`);
        }
      }
    } else if (Array.isArray(val)) {
      for (const item of val) scan(item);
    } else if (val && typeof val === 'object') {
      for (const key of Object.keys(val)) scan(val[key]);
    }
  }

  scan(target);

  return {
    isValid: violations.length === 0,
    violations
  };
}

/**
 * Sanitizes mild stray phrasing to maintain neutral inquiry
 */
export function sanitizeDirectivePhrasing(text: string): string {
  return text
    .replace(/\byou should consider\b/gi, 'one might examine')
    .replace(/\byou should\b/gi, 'it may be worth exploring whether to')
    .replace(/\byou must\b/gi, 'one could verify whether to')
    .replace(/\bthe best option\b/gi, 'this perspective')
    .replace(/\bi recommend\b/gi, 'one inquiry is')
    .replace(/\bgo with\b/gi, 'explore');
}
