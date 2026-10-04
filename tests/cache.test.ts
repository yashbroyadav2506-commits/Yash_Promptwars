/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { MemoryCacheService } from '../server/services/cacheService.js';
import { DecisionInput, XRayAnalysis } from '../shared/types.js';

describe('Privacy-Safe Request Cache Service', () => {
  const sampleInput: DecisionInput = {
    decisionTitle: 'Accept Job Offer A or B',
    rawDetails: 'Offer A has higher base salary.',
    rawWhyLeaning: 'I want financial security.',
    reversibility: 'costly',
    timeHorizon: '6-12 months'
  };

  const sampleAnalysis = { id: 'test-analysis' } as XRayAnalysis;

  it('generates consistent deterministic hashes for identical normalized text', () => {
    const cache = new MemoryCacheService();
    const hash1 = cache.generateHash(sampleInput);
    const hash2 = cache.generateHash({
      ...sampleInput,
      decisionTitle: '  ACCEPT Job Offer A or B  ', // with whitespace & casing
    });

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 length
  });

  it('stores and retrieves cached audits', () => {
    const cache = new MemoryCacheService(10, 50);
    cache.set(sampleInput, sampleAnalysis);
    const retrieved = cache.get(sampleInput);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('test-analysis');
  });

  it('respects entry limits by evicting oldest items', () => {
    const cache = new MemoryCacheService(10, 2);
    const input1 = { ...sampleInput, decisionTitle: 'Decision 1' };
    const input2 = { ...sampleInput, decisionTitle: 'Decision 2' };
    const input3 = { ...sampleInput, decisionTitle: 'Decision 3' };

    cache.set(input1, { id: '1' } as any);
    cache.set(input2, { id: '2' } as any);
    cache.set(input3, { id: '3' } as any);

    // input1 should have been evicted
    expect(cache.get(input1)).toBeNull();
    expect(cache.get(input3)?.id).toBe('3');
  });
});
