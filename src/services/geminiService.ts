/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  DecisionInput, 
  CallAResult, 
  CallBResult, 
  CallAResponseSchema, 
  CallBResponseSchema 
} from '../schemas/xraySchemas.js';
import { checkDirectiveLanguage, sanitizeDirectivePhrasing } from '../utils/directiveValidator.js';
import { clientCache } from '../utils/hashCache.js';

export interface ParallelAuditCallbacks {
  onCallAComplete?: (result: CallAResult) => void;
  onCallBComplete?: (result: CallBResult) => void;
  onError?: (error: string) => void;
}

/**
 * Executes Call A (Claims breakdown + Attention Map) via the backend API
 */
export async function executeCallA(input: DecisionInput, signal?: AbortSignal): Promise<CallAResult> {
  const cacheKey = `callA_${clientCache.hash(input)}`;
  const cached = clientCache.get(cacheKey);
  if (cached) return cached;

  let retries = 1;
  let lastError = '';

  while (retries >= 0) {
    if (signal?.aborted) {
      throw new DOMException('Operation aborted by user', 'AbortError');
    }

    try {
      const res = await fetch('/api/xray/call-a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
        signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const raw = await res.json();
      const parseResult = CallAResponseSchema.safeParse(raw);

      if (!parseResult.success) {
        console.warn('Call A schema validation failure:', parseResult.error.format());
        throw new Error('Call A output schema mismatch');
      }

      const data = parseResult.data;

      // Second-pass directive language validation
      const directiveCheck = checkDirectiveLanguage(data);
      if (!directiveCheck.isValid) {
        console.warn('Call A directive violations detected; sanitizing:', directiveCheck.violations);
        data.attentionMap = data.attentionMap.map(dim => ({
          ...dim,
          gapRationale: sanitizeDirectivePhrasing(dim.gapRationale),
          suggestedInquiry: sanitizeDirectivePhrasing(dim.suggestedInquiry)
        }));
      }

      clientCache.set(cacheKey, data);
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError' || signal?.aborted) {
        throw err;
      }
      lastError = err.message || 'Call A failed';
      retries--;
      if (retries >= 0) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  throw new Error(`Failed to complete reasoning claims and attention map: ${lastError}`);
}

/**
 * Executes Call B (Hidden assumptions, internal conflicts, lenses, questions) via the backend API
 */
export async function executeCallB(input: DecisionInput, signal?: AbortSignal): Promise<CallBResult> {
  const cacheKey = `callB_${clientCache.hash(input)}`;
  const cached = clientCache.get(cacheKey);
  if (cached) return cached;

  let retries = 1;
  let lastError = '';

  while (retries >= 0) {
    if (signal?.aborted) {
      throw new DOMException('Operation aborted by user', 'AbortError');
    }

    try {
      const res = await fetch('/api/xray/call-b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
        signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const raw = await res.json();
      const parseResult = CallBResponseSchema.safeParse(raw);

      if (!parseResult.success) {
        console.warn('Call B schema validation failure:', parseResult.error.format());
        throw new Error('Call B output schema mismatch');
      }

      const data = parseResult.data;

      // Second-pass directive language validation
      const directiveCheck = checkDirectiveLanguage(data);
      if (!directiveCheck.isValid) {
        console.warn('Call B directive violations detected; sanitizing:', directiveCheck.violations);
        data.hiddenAssumptions = data.hiddenAssumptions.map(ha => ({
          ...ha,
          statement: sanitizeDirectivePhrasing(ha.statement),
          vulnerability: sanitizeDirectivePhrasing(ha.vulnerability),
          cheapestTest: sanitizeDirectivePhrasing(ha.cheapestTest)
        }));
        data.questionsToSitWith = data.questionsToSitWith.map(q => sanitizeDirectivePhrasing(q));
      }

      clientCache.set(cacheKey, data);
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError' || signal?.aborted) {
        throw err;
      }
      lastError = err.message || 'Call B failed';
      retries--;
      if (retries >= 0) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  throw new Error(`Failed to complete hidden assumptions and perspective lenses: ${lastError}`);
}

/**
 * Executes both Call A and Call B in parallel, firing callbacks as each completes progressively
 */
export async function executeParallelXRay(
  input: DecisionInput, 
  callbacks: ParallelAuditCallbacks,
  signal?: AbortSignal
): Promise<{ callA: CallAResult; callB: CallBResult }> {
  const promiseA = executeCallA(input, signal)
    .then((resultA) => {
      callbacks.onCallAComplete?.(resultA);
      return resultA;
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        callbacks.onError?.(err.message);
      }
      throw err;
    });

  const promiseB = executeCallB(input, signal)
    .then((resultB) => {
      callbacks.onCallBComplete?.(resultB);
      return resultB;
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        callbacks.onError?.(err.message);
      }
      throw err;
    });

  const [callA, callB] = await Promise.all([promiseA, promiseB]);
  return { callA, callB };
}
