/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { 
  DecisionInput, 
  XRayAnalysis, 
  ReasoningDiff, 
  CrisisDetectionResult,
  ClaimType
} from '../../shared/types.js';
import { evaluateCrisisSafety } from '../prompts/safetyValidator.js';
import { validateDirectiveLanguage, sanitizeDirectiveText } from '../prompts/directiveValidator.js';
import { generateXRayAudit } from '../geminiClient.js';
import { requestCache } from './cacheService.js';

export interface AuditExecutionResult {
  status: 'success' | 'crisis' | 'validation_error';
  crisis?: CrisisDetectionResult;
  analysis?: XRayAnalysis;
  diff?: ReasoningDiff;
  error?: string;
}

// In-memory store for user analyses for diffing within active session
const sessionAnalysesStore = new Map<string, XRayAnalysis>();

export class XRayService {
  /**
   * Main audit pipeline: Input validation -> Safety check -> Cache -> Gemini analysis -> 2nd-pass guardrail validation
   */
  public async executeAudit(
    input: DecisionInput, 
    previousAnalysisId?: string
  ): Promise<AuditExecutionResult> {
    // 1. Input sanitization & length checks
    const sanitizedTitle = (input.decisionTitle || '').trim().slice(0, 500);
    const sanitizedDetails = (input.rawDetails || '').trim().slice(0, 10000);
    const sanitizedWhy = (input.rawWhyLeaning || '').trim().slice(0, 10000);

    const cleanInput: DecisionInput = {
      decisionTitle: sanitizedTitle,
      rawDetails: sanitizedDetails,
      rawWhyLeaning: sanitizedWhy,
      reversibility: input.reversibility || 'costly',
      timeHorizon: input.timeHorizon || '6-12 months',
      clientSessionId: input.clientSessionId
    };

    if (!cleanInput.decisionTitle) {
      return {
        status: 'validation_error',
        error: 'Please provide a decision statement to analyze.'
      };
    }

    // 2. Safety / Crisis Interception
    const combinedInputText = `${cleanInput.decisionTitle} ${cleanInput.rawDetails} ${cleanInput.rawWhyLeaning}`;
    const crisisCheck = evaluateCrisisSafety(combinedInputText);
    if (crisisCheck.isCrisis) {
      return {
        status: 'crisis',
        crisis: crisisCheck
      };
    }

    // 3. Cache lookup
    const cached = requestCache.get(cleanInput);
    if (cached) {
      let diff: ReasoningDiff | undefined;
      if (previousAnalysisId && sessionAnalysesStore.has(previousAnalysisId)) {
        diff = this.computeDiff(sessionAnalysesStore.get(previousAnalysisId)!, cached);
      }
      return {
        status: 'success',
        analysis: cached,
        diff
      };
    }

    // 4. Generate structured analysis via Gemini
    const rawResult = await generateXRayAudit(cleanInput);

    // Compute basic word and claim stats
    const totalWords = combinedInputText.split(/\s+/).filter(Boolean).length;
    const claimCounts: Record<ClaimType, number> = {
      FACT: 0,
      ASSUMPTION: 0,
      'VALUE/PREFERENCE': 0,
      PREDICTION: 0
    };

    const claims = Array.isArray(rawResult.claims) ? rawResult.claims : [];
    for (const c of claims) {
      if (c.type && claimCounts[c.type as ClaimType] !== undefined) {
        claimCounts[c.type as ClaimType]++;
      }
    }

    const attentionMap = Array.isArray(rawResult.attentionMap) ? rawResult.attentionMap : [];
    const hiddenAssumptions = Array.isArray(rawResult.hiddenAssumptions) ? rawResult.hiddenAssumptions : [];
    const internalConflicts = Array.isArray(rawResult.internalConflicts) ? rawResult.internalConflicts : [];
    const questionsToSitWith = Array.isArray(rawResult.questionsToSitWith) ? rawResult.questionsToSitWith : [];

    const majorGapsCount = attentionMap.filter((a: any) => a.isGap).length;
    const untestedAssumptionsCount = hiddenAssumptions.length;

    const analysisId = 'xray-' + crypto.randomUUID();

    const analysis: XRayAnalysis = {
      id: analysisId,
      createdAt: new Date().toISOString(),
      decisionTitle: cleanInput.decisionTitle,
      rawDetails: cleanInput.rawDetails,
      rawWhyLeaning: cleanInput.rawWhyLeaning,
      reversibility: cleanInput.reversibility || 'costly',
      timeHorizon: cleanInput.timeHorizon || '6-12 months',
      isThinInput: !!rawResult.isThinInput,
      thinInputNotice: rawResult.thinInputNotice || '',
      guardrailPassed: true,
      secondPassValidated: false,
      claims,
      attentionMap,
      hiddenAssumptions,
      internalConflicts,
      perspectiveLenses: rawResult.perspectiveLenses || {
        futureSelfLens: { sixMonths: '', fiveYears: '' },
        preMortemLens: { scenarioDescription: '', vulnerablePoints: [], diagnosticQuestion: '' },
        outsiderLens: { affectedStakeholder: '', probingQuestion: '' },
        oppositeSteelmanLens: { counterOptionName: '', steelmanCase: '', criticalQuestion: '' }
      },
      questionsToSitWith,
      stats: {
        totalWords,
        claimCounts,
        majorGapsCount,
        untestedAssumptionsCount
      }
    };

    // 5. SECOND-PASS DIRECTIVE VALIDATION (Requirement 3)
    const directiveValidation = validateDirectiveLanguage(analysis);
    if (!directiveValidation.isValid) {
      console.warn('[Guardrail] Detected directive language violations:', directiveValidation.detectedViolations);
      // Sanitize questions and analysis strings
      analysis.questionsToSitWith = analysis.questionsToSitWith.map(q => sanitizeDirectiveText(q));
      analysis.hiddenAssumptions = analysis.hiddenAssumptions.map(h => ({
        ...h,
        statement: sanitizeDirectiveText(h.statement),
        vulnerability: sanitizeDirectiveText(h.vulnerability),
        cheapestTest: sanitizeDirectiveText(h.cheapestTest)
      }));
      // Re-check
      const recheck = validateDirectiveLanguage(analysis);
      analysis.secondPassValidated = recheck.isValid;
    } else {
      analysis.secondPassValidated = true;
    }

    // Cache the verified analysis
    requestCache.set(cleanInput, analysis);
    sessionAnalysesStore.set(analysis.id, analysis);

    // Compute diff if a previous analysis was referenced
    let diff: ReasoningDiff | undefined;
    if (previousAnalysisId && sessionAnalysesStore.has(previousAnalysisId)) {
      diff = this.computeDiff(sessionAnalysesStore.get(previousAnalysisId)!, analysis);
    }

    return {
      status: 'success',
      analysis,
      diff
    };
  }

  /**
   * Computes reasoning diff between two iterations of an audited decision
   */
  public computeDiff(prev: XRayAnalysis, curr: XRayAnalysis): ReasoningDiff {
    const prevAssumptionStatements = new Set(prev.hiddenAssumptions.map(a => a.statement.toLowerCase().trim()));
    const currAssumptionStatements = new Set(curr.hiddenAssumptions.map(a => a.statement.toLowerCase().trim()));

    const resolvedAssumptions = prev.hiddenAssumptions
      .filter(a => !currAssumptionStatements.has(a.statement.toLowerCase().trim()))
      .map(a => a.statement);

    const newAssumptions = curr.hiddenAssumptions
      .filter(a => !prevAssumptionStatements.has(a.statement.toLowerCase().trim()))
      .map(a => a.statement);

    const prevGapNames = new Set(prev.attentionMap.filter(a => a.isGap).map(a => a.name));
    const currGapNames = new Set(curr.attentionMap.filter(a => a.isGap).map(a => a.name));

    const closedGaps = Array.from(prevGapNames).filter(g => !currGapNames.has(g));
    const newGaps = Array.from(currGapNames).filter(g => !prevGapNames.has(g));

    const prevTotalClaims = Math.max(1, prev.claims.length);
    const currTotalClaims = Math.max(1, curr.claims.length);

    const prevFactRatio = Math.round((prev.stats.claimCounts.FACT / prevTotalClaims) * 100);
    const currFactRatio = Math.round((curr.stats.claimCounts.FACT / currTotalClaims) * 100);
    const prevAssumptionRatio = Math.round((prev.stats.claimCounts.ASSUMPTION / prevTotalClaims) * 100);
    const currAssumptionRatio = Math.round((curr.stats.claimCounts.ASSUMPTION / currTotalClaims) * 100);

    let summary = `Your reasoning expanded across ${curr.stats.totalWords} words. `;
    if (closedGaps.length > 0) {
      summary += `You closed attention gaps in ${closedGaps.join(', ')}. `;
    }
    if (currAssumptionRatio < prevAssumptionRatio) {
      summary += `Unverified assumptions dropped from ${prevAssumptionRatio}% to ${currAssumptionRatio}% of your claims.`;
    } else {
      summary += `Audit surfaced ${newAssumptions.length} fresh assumptions to investigate.`;
    }

    return {
      previousId: prev.id,
      currentId: curr.id,
      resolvedAssumptions,
      newAssumptions,
      closedGaps,
      newGaps,
      claimRatioShift: {
        previousFactRatio: prevFactRatio,
        currentFactRatio: currFactRatio,
        previousAssumptionRatio: prevAssumptionRatio,
        currentAssumptionRatio: currAssumptionRatio
      },
      summary
    };
  }

  public getSessionAnalysis(id: string): XRayAnalysis | undefined {
    return sessionAnalysesStore.get(id);
  }

  public clearSession(id: string): void {
    sessionAnalysesStore.delete(id);
  }
}

export const xrayService = new XRayService();
