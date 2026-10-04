/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const ClaimTypeSchema = z.enum(['FACT', 'ASSUMPTION', 'VALUE', 'PREDICTION']);
export type ClaimType = z.infer<typeof ClaimTypeSchema>;

export const ReasoningClaimSchema = z.object({
  id: z.string(),
  type: ClaimTypeSchema,
  quote: z.string().min(1),
  statement: z.string().min(1),
  epistemicNote: z.string().optional()
});
export type ReasoningClaim = z.infer<typeof ReasoningClaimSchema>;

export const AttentionDimensionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  airtime: z.number().min(0).max(100),
  likelyWeight: z.number().min(0).max(100),
  isGap: z.boolean(),
  gapRationale: z.string(),
  suggestedInquiry: z.string()
});
export type AttentionDimension = z.infer<typeof AttentionDimensionSchema>;

export const CallAResponseSchema = z.object({
  claims: z.array(ReasoningClaimSchema).min(1),
  attentionMap: z.array(AttentionDimensionSchema).min(5),
  screenReaderSummary: z.string().min(1)
});
export type CallAResult = z.infer<typeof CallAResponseSchema>;

export const HiddenAssumptionSchema = z.object({
  id: z.string(),
  statement: z.string().min(1),
  sourceQuote: z.string().optional(),
  vulnerability: z.string().min(1),
  cheapestTest: z.string().min(1)
});
export type HiddenAssumption = z.infer<typeof HiddenAssumptionSchema>;

export const InternalConflictSchema = z.object({
  id: z.string(),
  valueQuote: z.string().min(1),
  reasonQuote: z.string().min(1),
  tensionAnalysis: z.string().min(1),
  inquiry: z.string().min(1)
});
export type InternalConflict = z.infer<typeof InternalConflictSchema>;

export const PerspectiveLensesSchema = z.object({
  futureSelfLens: z.object({
    sixMonths: z.string().min(1),
    fiveYears: z.string().min(1)
  }),
  preMortemLens: z.object({
    scenarioDescription: z.string().min(1),
    vulnerablePoints: z.array(z.string()).min(1),
    diagnosticQuestion: z.string().min(1)
  }),
  outsiderLens: z.object({
    affectedStakeholder: z.string().min(1),
    probingQuestion: z.string().min(1)
  }),
  oppositeSteelmanLens: z.object({
    counterOptionName: z.string().min(1),
    steelmanCase: z.string().min(1),
    criticalQuestion: z.string().min(1)
  })
});
export type PerspectiveLenses = z.infer<typeof PerspectiveLensesSchema>;

export const CallBResponseSchema = z.object({
  hiddenAssumptions: z.array(HiddenAssumptionSchema).min(1),
  internalConflicts: z.array(InternalConflictSchema),
  perspectiveLenses: PerspectiveLensesSchema,
  questionsToSitWith: z.array(z.string()).min(5).max(10)
});
export type CallBResult = z.infer<typeof CallBResponseSchema>;

export const DecisionInputSchema = z.object({
  decisionTitle: z.string().min(3),
  rawDetails: z.string(),
  rawWhyLeaning: z.string(),
  reversibility: z.enum(['easy', 'costly', 'near-permanent']).optional(),
  timeHorizon: z.enum(['1-3 months', '6-12 months', '2-5 years', '10+ years']).optional(),
  plainLanguage: z.boolean().optional()
});
export type DecisionInput = z.infer<typeof DecisionInputSchema>;

export interface CombinedXRayAnalysis {
  id: string;
  createdAt: string;
  input: DecisionInput;
  callA?: CallAResult;
  callB?: CallBResult;
  stats: {
    totalWords: number;
    claimCounts: Record<ClaimType, number>;
    majorGapsCount: number;
    untestedAssumptionsCount: number;
  };
}
