/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import axe from 'axe-core';

import { IntakeForm } from '../src/components/IntakeForm.js';
import { AttentionMapComponent } from '../src/components/AttentionMap.js';
import { ReasoningBreakdown } from '../src/components/ReasoningBreakdown.js';
import { AssumptionsAudit } from '../src/components/AssumptionsAudit.js';
import { ConflictsAndLenses } from '../src/components/ConflictsAndLenses.js';
import { ReflectAndReRun } from '../src/components/ReflectAndReRun.js';
import { ThinkingShiftDiffView } from '../src/components/ThinkingShiftDiffView.js';
import { DecisionReflectionView } from '../src/components/DecisionReflectionView.js';
import { CrisisModal } from '../src/components/CrisisModal.js';
import { ThreatModelModal } from '../src/components/ThreatModelModal.js';
import { A11yModal } from '../src/components/A11yModal.js';
import { DEMO_SCENARIO } from '../shared/constants.js';
import { generateDeterministicFallback } from '../server/geminiClient.js';

const DEMO_ANALYSIS = generateDeterministicFallback(DEMO_SCENARIO);

/**
 * Runs axe-core WCAG 2.2 AA validation on rendered HTML
 */
async function auditA11y(component: React.ReactElement): Promise<axe.Result[]> {
  const html = renderToString(component);
  document.body.innerHTML = `<main id="main-content">${html}</main>`;
  
  const results = await axe.run(document.body, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
    },
    rules: {
      // In server-rendered jsdom, color-contrast checks require real computed pixel styles
      'color-contrast': { enabled: false },
      // Region requires a banner/main outer landmark
      'region': { enabled: false }
    }
  });

  return results.violations;
}

describe('Automated WCAG 2.2 AA Accessibility Audit (axe-core)', () => {
  it('Screen 1: IntakeForm passes axe WCAG 2.2 AA checks', async () => {
    const violations = await auditA11y(
      <IntakeForm
        input={DEMO_SCENARIO as any}
        onChange={() => {}}
        onSubmit={() => {}}
        isAnalyzing={false}
        plainLanguage={false}
        onLoadExample={() => {}}
        hasPreviousRun={false}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 2: AttentionMap passes axe WCAG 2.2 AA checks (table & paired bars)', async () => {
    const violations = await auditA11y(
      <AttentionMapComponent
        dimensions={DEMO_ANALYSIS.attentionMap as any}
        screenReaderSummary="Attention Map screen reader summary"
        plainLanguage={false}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 3: ReasoningBreakdown passes axe WCAG 2.2 AA checks', async () => {
    const violations = await auditA11y(
      <ReasoningBreakdown
        claims={DEMO_ANALYSIS.claims as any}
        plainLanguage={false}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 4: AssumptionsAudit passes axe WCAG 2.2 AA checks', async () => {
    const violations = await auditA11y(
      <AssumptionsAudit
        assumptions={DEMO_ANALYSIS.hiddenAssumptions as any}
        testedAssumptions={{ 'ha-1': true }}
        onToggleTested={() => {}}
        plainLanguage={false}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 5: ConflictsAndLenses passes axe WCAG 2.2 AA checks', async () => {
    const violations = await auditA11y(
      <ConflictsAndLenses
        conflicts={DEMO_ANALYSIS.internalConflicts as any}
        lenses={DEMO_ANALYSIS.perspectiveLenses as any}
        plainLanguage={false}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 6: ReflectAndReRun passes axe WCAG 2.2 AA checks', async () => {
    const violations = await auditA11y(
      <ReflectAndReRun
        questions={DEMO_ANALYSIS.questionsToSitWith}
        userReflections={{ 'q-0': 'I spoke with alumni yesterday.' }}
        onUpdateReflection={() => {}}
        input={DEMO_SCENARIO as any}
        onUpdateInput={() => {}}
        onReRun={() => {}}
        isAnalyzing={false}
        plainLanguage={false}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 7: ThinkingShiftDiffView passes axe WCAG 2.2 AA checks', async () => {
    const sampleDiff = {
      timestamp: new Date().toISOString(),
      previousRunId: 'prev-1',
      currentRunId: 'curr-1',
      headlineSummary: 'Here is how your thinking shifted between runs.',
      narrowedGaps: [
        {
          id: 'learning',
          name: 'Learning & Skill Growth',
          beforeAirtime: 5,
          afterAirtime: 25,
          deltaAirtime: 20,
          typicalWeight: 85,
          gapClosed: false,
          notes: 'Attention expanded from 5% to 25%.'
        }
      ],
      otherShifts: [],
      addressedAssumptions: [
        {
          id: 'ha-1',
          statement: 'Solo interning accelerates hiring',
          reason: 'Clarified in revised text'
        }
      ],
      newAssumptions: [],
      newConflicts: [],
      claimShifts: {
        previousFacts: 2,
        currentFacts: 5,
        previousAssumptions: 3,
        currentAssumptions: 1,
        previousWords: 55,
        currentWords: 88
      }
    };

    const violations = await auditA11y(
      <ThinkingShiftDiffView
        diff={sampleDiff}
        onDismiss={() => {}}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 8: DecisionReflectionView (Print/Export) passes axe WCAG 2.2 AA checks', async () => {
    const sampleCombined = {
      id: 'comb-1',
      createdAt: new Date().toISOString(),
      input: DEMO_SCENARIO as any,
      stats: {
        totalWords: 85,
        claimCounts: { FACT: 3, ASSUMPTION: 2, VALUE: 1, PREDICTION: 1 },
        majorGapsCount: 2,
        untestedAssumptionsCount: 2
      },
      callA: {
        claims: DEMO_ANALYSIS.claims,
        attentionMap: DEMO_ANALYSIS.attentionMap,
        screenReaderSummary: 'Summary'
      },
      callB: {
        hiddenAssumptions: DEMO_ANALYSIS.hiddenAssumptions,
        internalConflicts: DEMO_ANALYSIS.internalConflicts,
        perspectiveLenses: DEMO_ANALYSIS.perspectiveLenses,
        questionsToSitWith: DEMO_ANALYSIS.questionsToSitWith
      }
    };

    const violations = await auditA11y(
      <DecisionReflectionView
        analysis={sampleCombined as any}
        userReflections={{}}
        testedAssumptions={{}}
        onBack={() => {}}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 9: CrisisModal passes axe WCAG 2.2 AA checks', async () => {
    const sampleCrisis = {
      isCrisis: true,
      detectedTopics: ['distress'],
      supportMessage: 'Support message',
      hotlineResources: [
        { name: '988 Lifeline', contact: '988', description: 'Free 24/7' }
      ]
    };

    const violations = await auditA11y(
      <CrisisModal
        crisis={sampleCrisis}
        onClose={() => {}}
      />
    );
    expect(violations).toEqual([]);
  });

  it('Screen 10: ThreatModelModal and A11yModal pass axe WCAG 2.2 AA checks', async () => {
    const threatViolations = await auditA11y(<ThreatModelModal onClose={() => {}} />);
    expect(threatViolations).toEqual([]);

    const a11yViolations = await auditA11y(<A11yModal onClose={() => {}} />);
    expect(a11yViolations).toEqual([]);
  });
});
