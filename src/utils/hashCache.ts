/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DecisionInput } from '../schemas/xraySchemas.js';

/**
 * Client-side in-memory hash cache for normalized inputs
 */
class HashCache {
  private cache = new Map<string, { timestamp: number; data: any }>();
  private lastCallTimestamp = 0;
  private readonly COOLDOWN_MS = 2500; // 2.5s cooldown between analysis clicks

  public hash(input: DecisionInput): string {
    const raw = `${input.decisionTitle}:::${input.rawDetails}:::${input.rawWhyLeaning}:::${input.reversibility || ''}:::${input.timeHorizon || ''}:::${input.plainLanguage || false}`.toLowerCase().trim();
    // Fast 32-bit FNV-1a hash formatted as hex
    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  public get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    // 15 min TTL
    if (Date.now() - item.timestamp > 15 * 60 * 1000) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  public set(key: string, data: any): void {
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { timestamp: Date.now(), data });
  }

  public checkCooldown(): { allowed: boolean; remainingMs: number } {
    const elapsed = Date.now() - this.lastCallTimestamp;
    if (elapsed < this.COOLDOWN_MS) {
      return { allowed: false, remainingMs: this.COOLDOWN_MS - elapsed };
    }
    this.lastCallTimestamp = Date.now();
    return { allowed: true, remainingMs: 0 };
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const clientCache = new HashCache();
