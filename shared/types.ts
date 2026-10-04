/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClaimType = 'FACT' | 'ASSUMPTION' | 'VALUE/PREFERENCE' | 'PREDICTION';

export interface ReasoningClaim {
  id: string;
  type: ClaimType;
  quote: string; // The user's exact or near-exact words
  statement: string; // Plain-English breakdown of the claim
  epistemicNote?: string; // Why this is classified as such
}

export type ReversibilityLevel = 'easy' | 'costly' | 'near-permanent';
export type TimeHorizon = '1-3 months' | '6-12 months' | '2-5 years' | '10+ years';

export interface AttentionDimension {
  id: string;
  name: string;
  description: string;
  airtime: number; // 0 to 100 (% of user text addressing this)
  likelyWeight: number; // 0 to 100 (AI heuristic weight for this decision type)
  gapScore?: number; // AI calculated gap severity (likelyWeight - airtime, scaled)
  isGap: boolean; // Flagged when likelyWeight is high but airtime is low
  gapRationale: string; // Why under-attending to this dimension creates blind spots
  suggestedInquiry: string; // A neutral question to probe this dimension
}

export interface HiddenAssumption {
  id: string;
  statement: string; // Plain statement of the assumption
  sourceQuote?: string; // Where this was implied or stated
  vulnerability: string; // Why it might be shaky or incomplete
  cheapestTest: string; // Low-cost, fast test (<72h) to verify before deciding
  isTested?: boolean;
}

export interface InternalConflict {
  id: string;
  valueQuote: string; // Stated value or goal from user
  reasonQuote: string; // Stated action or leaning reason
  tensionAnalysis: string; // Objective description of tension between the two
  inquiry: string; // Reflective question to clarify priority
}

export interface PerspectiveLenses {
  futureSelfLens: {
    sixMonths: string;
    fiveYears: string;
  };
  preMortemLens: {
    scenarioDescription: string;
    vulnerablePoints: string[];
    diagnosticQuestion: string;
  };
  outsiderLens: {
    affectedStakeholder: string;
    probingQuestion: string;
  };
  oppositeSteelmanLens: {
    counterOptionName: string;
    steelmanCase: string; // Strongest honest argument for the unchosen path
    criticalQuestion: string;
  };
}

export interface XRayAnalysis {
  id: string;
  createdAt: string;
  decisionTitle: string;
  rawDetails: string;
  rawWhyLeaning: string;
  reversibility: ReversibilityLevel;
  timeHorizon: TimeHorizon;
  
  // Guardrail & Meta
  isThinInput: boolean;
  thinInputNotice?: string;
  guardrailPassed: boolean;
  secondPassValidated: boolean;

  // Analysis Layers
  claims: ReasoningClaim[];
  attentionMap: AttentionDimension[];
  hiddenAssumptions: HiddenAssumption[];
  internalConflicts: InternalConflict[];
  perspectiveLenses: PerspectiveLenses;
  questionsToSitWith: string[]; // 5-8 open, non-leading questions
  
  // Summary reasoning statistics
  stats: {
    totalWords: number;
    claimCounts: Record<ClaimType, number>;
    majorGapsCount: number;
    untestedAssumptionsCount: number;
  };
}

export interface DecisionInput {
  decisionTitle: string;
  rawDetails: string;
  rawWhyLeaning: string;
  reversibility?: ReversibilityLevel;
  timeHorizon?: TimeHorizon;
  clientSessionId?: string;
}

export interface ReasoningDiff {
  previousId: string;
  currentId: string;
  resolvedAssumptions: string[];
  newAssumptions: string[];
  closedGaps: string[];
  newGaps: string[];
  claimRatioShift: {
    previousFactRatio: number;
    currentFactRatio: number;
    previousAssumptionRatio: number;
    currentAssumptionRatio: number;
  };
  summary: string;
}

export interface CrisisDetectionResult {
  isCrisis: boolean;
  detectedTopics: string[];
  supportMessage: string;
  hotlineResources: Array<{
    name: string;
    contact: string;
    description: string;
  }>;
}

export interface DirectiveValidationResult {
  isValid: boolean;
  detectedViolations: string[];
  sanitized?: boolean;
}
