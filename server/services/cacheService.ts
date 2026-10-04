/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { DecisionInput, XRayAnalysis } from '../../shared/types.js';

interface CacheItem {
  timestamp: number;
  data: XRayAnalysis;
}

export class MemoryCacheService {
  private cache = new Map<string, CacheItem>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(ttlMinutes = 20, maxEntries = 200) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.maxEntries = maxEntries;
  }

  /**
   * Generates a privacy-safe one-way SHA-256 hash of normalized user input
   */
  public generateHash(input: DecisionInput): string {
    const normalized = [
      input.decisionTitle.trim().toLowerCase(),
      input.rawDetails.trim().toLowerCase(),
      input.rawWhyLeaning.trim().toLowerCase(),
      input.reversibility || '',
      input.timeHorizon || ''
    ].join('|||');

    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  public get(input: DecisionInput): XRayAnalysis | null {
    const key = this.generateHash(input);
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  public set(input: DecisionInput, data: XRayAnalysis): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    const key = this.generateHash(input);
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const requestCache = new MemoryCacheService();
