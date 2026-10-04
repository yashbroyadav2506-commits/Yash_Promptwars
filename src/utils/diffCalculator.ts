/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CombinedXRayAnalysis } from '../schemas/xraySchemas.js';

export interface NarrowedGapItem {
  id: string;
  name: string;
  beforeAirtime: number;
  afterAirtime: number;
  deltaAirtime: number;
  typicalWeight: number;
  gapClosed: boolean;
  notes: string;
}

export interface AddressedAssumptionItem {
  id: string;
  statement: string;
  reason: string;
}

export interface NewAssumptionItem {
  id: string;
  statement: string;
  vulnerability: string;
  cheapestTest: string;
}

export interface NewConflictItem {
  id: string;
  valueQuote: string;
  reasonQuote: string;
  tensionAnalysis: string;
}

export interface ThinkingShiftDiff {
  timestamp: string;
  previousRunId: string;
  currentRunId: string;
  headlineSummary: string;
  narrowedGaps: NarrowedGapItem[];
  otherShifts: NarrowedGapItem[];
  addressedAssumptions: AddressedAssumptionItem[];
  newAssumptions: NewAssumptionItem[];
  newConflicts: NewConflictItem[];
  claimShifts: {
    previousFacts: number;
    currentFacts: number;
    previousAssumptions: number;
    currentAssumptions: number;
    previousWords: number;
    currentWords: number;
  };
}

/**
 * Computes how thinking shifted between two analysis iterations.
 * Strictly adheres to non-judgmental language: NEVER uses "improved" or "better".
 */
export function computeThinkingShift(
  prev: CombinedXRayAnalysis,
  curr: CombinedXRayAnalysis,
  testedIds: Record<string, boolean> = {}
): ThinkingShiftDiff {
  const prevDims = prev.callA?.attentionMap || [];
  const currDims = curr.callA?.attentionMap || [];

  const currDimsMap = new Map(currDims.map(d => [d.id, d]));
  const narrowedGaps: NarrowedGapItem[] = [];
  const otherShifts: NarrowedGapItem[] = [];

  for (const prevDim of prevDims) {
    const currDim = currDimsMap.get(prevDim.id);
    if (!currDim) continue;

    const delta = currDim.airtime - prevDim.airtime;
    const gapClosed = prevDim.isGap && !currDim.isGap;

    const item: NarrowedGapItem = {
      id: prevDim.id,
      name: prevDim.name,
      beforeAirtime: prevDim.airtime,
      afterAirtime: currDim.airtime,
      deltaAirtime: delta,
      typicalWeight: currDim.likelyWeight,
      gapClosed,
      notes: gapClosed
        ? `Previously flagged as an attention gap (${prevDim.airtime}% airtime). Now expanded to ${currDim.airtime}% airtime.`
        : delta > 0
        ? `Airtime shifted from ${prevDim.airtime}% to ${currDim.airtime}%.`
        : delta < 0
        ? `Airtime narrowed from ${prevDim.airtime}% to ${currDim.airtime}%.`
        : `Airtime remained unchanged at ${currDim.airtime}%.`
    };

    if (prevDim.isGap && delta > 0) {
      narrowedGaps.push(item);
    } else if (Math.abs(delta) >= 3) {
      otherShifts.push(item);
    }
  }

  // Assumptions comparison
  const prevAssumptions = prev.callB?.hiddenAssumptions || [];
  const currAssumptions = curr.callB?.hiddenAssumptions || [];

  const currStatements = new Set(currAssumptions.map(a => a.statement.toLowerCase().trim()));
  const prevStatements = new Set(prevAssumptions.map(a => a.statement.toLowerCase().trim()));

  const addressedAssumptions: AddressedAssumptionItem[] = [];

  for (const pa of prevAssumptions) {
    const isExplicitlyTested = !!testedIds[pa.id];
    const isNoLongerPresent = !currStatements.has(pa.statement.toLowerCase().trim());

    if (isExplicitlyTested) {
      addressedAssumptions.push({
        id: pa.id,
        statement: pa.statement,
        reason: 'Marked as investigated/tested by you in your reflection checklist.'
      });
    } else if (isNoLongerPresent) {
      addressedAssumptions.push({
        id: pa.id,
        statement: pa.statement,
        reason: 'Addressed or clarified in your revised text; no longer identified as an unstated assumption.'
      });
    }
  }

  // New assumptions that appeared
  const newAssumptions: NewAssumptionItem[] = [];
  for (const ca of currAssumptions) {
    if (!prevStatements.has(ca.statement.toLowerCase().trim())) {
      newAssumptions.push({
        id: ca.id,
        statement: ca.statement,
        vulnerability: ca.vulnerability,
        cheapestTest: ca.cheapestTest
      });
    }
  }

  // New conflicts that appeared
  const prevConflicts = prev.callB?.internalConflicts || [];
  const currConflicts = curr.callB?.internalConflicts || [];

  const prevConflictValues = new Set(prevConflicts.map(c => c.valueQuote.toLowerCase().trim()));
  const newConflicts: NewConflictItem[] = [];

  for (const cc of currConflicts) {
    if (!prevConflictValues.has(cc.valueQuote.toLowerCase().trim())) {
      newConflicts.push({
        id: cc.id,
        valueQuote: cc.valueQuote,
        reasonQuote: cc.reasonQuote,
        tensionAnalysis: cc.tensionAnalysis
      });
    }
  }

  // Non-judgmental narrative headline
  const prevWords = prev.stats.totalWords;
  const currWords = curr.stats.totalWords;
  let headline = `Here is how your thinking shifted: your write-up changed from ${prevWords} to ${currWords} words. `;

  if (narrowedGaps.length > 0) {
    headline += `Attention expanded in ${narrowedGaps.map(g => `'${g.name.split('&')[0].trim()}'`).join(', ')}. `;
  }
  if (addressedAssumptions.length > 0) {
    headline += `You addressed ${addressedAssumptions.length} previously unexamined assumption${addressedAssumptions.length > 1 ? 's' : ''}. `;
  }
  if (newAssumptions.length > 0) {
    headline += `${newAssumptions.length} fresh assumption${newAssumptions.length > 1 ? 's' : ''} surfaced for investigation.`;
  }

  return {
    timestamp: new Date().toISOString(),
    previousRunId: prev.id,
    currentRunId: curr.id,
    headlineSummary: headline.trim(),
    narrowedGaps,
    otherShifts,
    addressedAssumptions,
    newAssumptions,
    newConflicts,
    claimShifts: {
      previousFacts: prev.stats.claimCounts.FACT,
      currentFacts: curr.stats.claimCounts.FACT,
      previousAssumptions: prev.stats.claimCounts.ASSUMPTION,
      currentAssumptions: curr.stats.claimCounts.ASSUMPTION,
      previousWords: prevWords,
      currentWords: currWords
    }
  };
}
