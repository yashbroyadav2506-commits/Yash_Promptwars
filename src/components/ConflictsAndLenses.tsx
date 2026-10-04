/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, memo } from 'react';
import { InternalConflict, PerspectiveLenses } from '../schemas/xraySchemas.js';
import { GitFork, Compass, ShieldAlert, Sparkles } from 'lucide-react';

interface ConflictsAndLensesProps {
  conflicts: InternalConflict[];
  lenses: PerspectiveLenses;
  plainLanguage?: boolean;
}

export const ConflictsAndLenses: React.FC<ConflictsAndLensesProps> = memo(({
  conflicts,
  lenses,
  plainLanguage = false
}) => {
  const [activeLens, setActiveLens] = useState<'future' | 'premortem' | 'outsider' | 'steelman'>('future');

  return (
    <div className="space-y-10">
      {/* Layer D: Internal Conflicts Detector */}
      <section aria-labelledby="conflicts-title" className="bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl transition-colors">
        <div className="mb-6">
          <span className="text-xs uppercase font-mono font-bold text-purple-400 light:text-purple-600">
            {plainLanguage ? 'Goals vs Leaning Tensions' : 'Internal Conflict Detector'}
          </span>
          <h3 id="conflicts-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-neutral-900 mt-1 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-purple-400" aria-hidden="true" />
            <span>Contradictions Between Stated Goals & Stated Reasons</span>
          </h3>
          <p className="text-sm text-neutral-400 light:text-neutral-600 mt-1">
            Phrased neutrally and non-accusingly: quoting your own words where high-level aspirations pull in a different direction from tactical leaning reasons.
          </p>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-4 bg-neutral-950/60 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl text-neutral-400 light:text-neutral-600 text-xs">
            No sharp internal contradictions detected between your stated goals and reasons.
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="p-5 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-900/70 light:bg-white border border-purple-500/30 light:border-purple-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-400 light:text-purple-700 block">
                      Stated Goal / Principle (Your Words)
                    </span>
                    <blockquote className="text-xs italic text-neutral-100 light:text-neutral-800">
                      "{conflict.valueQuote}"
                    </blockquote>
                  </div>

                  <div className="p-4 bg-neutral-900/70 light:bg-white border border-amber-500/30 light:border-amber-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 light:text-amber-700 block">
                      Stated Leaning Reason (Your Words)
                    </span>
                    <blockquote className="text-xs italic text-neutral-100 light:text-neutral-800">
                      "{conflict.reasonQuote}"
                    </blockquote>
                  </div>
                </div>

                <div className="p-4 bg-neutral-900/50 light:bg-neutral-100 border border-neutral-800 light:border-neutral-200 rounded-xl text-xs space-y-2">
                  <p className="text-neutral-200 light:text-neutral-800 leading-relaxed">
                    <strong className="text-neutral-100 light:text-neutral-900">Tension Analysis:</strong> {conflict.tensionAnalysis}
                  </p>
                  <p className="text-cyan-300 light:text-cyan-800 italic pt-1 border-t border-neutral-800/80 light:border-neutral-200 font-medium">
                    <strong>Clarifying Inquiry:</strong> "{conflict.inquiry}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Layer E: Four Perspective Lenses */}
      <section aria-labelledby="lenses-title" className="bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl transition-colors">
        <div className="mb-6">
          <span className="text-xs uppercase font-mono font-bold text-emerald-400 light:text-emerald-600">
            {plainLanguage ? 'Diagnostic Angles' : 'Perspective Shift Lenses'}
          </span>
          <h3 id="lenses-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-neutral-900 mt-1 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            <span>Four Diagnostic Cognitive Lenses (Questions Only)</span>
          </h3>
          <p className="text-sm text-neutral-400 light:text-neutral-600 mt-1">
            Questions framed from distinct vantage points to shake unexamined tunnel vision.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 light:border-neutral-200 pb-3 mb-6" role="tablist" aria-label="Perspective lenses">
          {(
            [
              { id: 'future', label: 'Future-Self Lens' },
              { id: 'premortem', label: 'Pre-Mortem Lens' },
              { id: 'outsider', label: 'Outsider Lens' },
              { id: 'steelman', label: 'Opposite-Steelman Lens' },
            ] as const
          ).map(({ id, label }) => (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={activeLens === id}
              onClick={() => setActiveLens(id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                activeLens === id
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 light:bg-emerald-100 light:text-emerald-900 light:border-emerald-600'
                  : 'bg-neutral-950 light:bg-neutral-100 border-neutral-800 light:border-neutral-300 text-neutral-400 light:text-neutral-600 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab 1: Future Self */}
        {activeLens === 'future' && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 light:text-emerald-700 block">
                6 Months Later Lens:
              </span>
              <p className="text-sm text-neutral-200 light:text-neutral-800 leading-relaxed">
                {lenses.futureSelfLens.sixMonths}
              </p>
            </div>
            <div className="p-4 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 light:text-emerald-700 block">
                5 Years Later Lens:
              </span>
              <p className="text-sm text-neutral-200 light:text-neutral-800 leading-relaxed">
                {lenses.futureSelfLens.fiveYears}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Pre-Mortem */}
        {activeLens === 'premortem' && (
          <div className="p-5 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-rose-400 light:text-rose-700 block mb-1">
                Hypothetical Failure Scenario:
              </span>
              <p className="text-sm text-neutral-200 light:text-neutral-800 leading-relaxed">
                {lenses.preMortemLens.scenarioDescription}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-neutral-400 light:text-neutral-600 block mb-2">Most likely weak links:</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300 light:text-neutral-700">
                {lenses.preMortemLens.vulnerablePoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-neutral-800 light:border-neutral-200">
              <span className="text-xs font-bold text-amber-300 light:text-amber-800 block mb-1">Diagnostic Question:</span>
              <p className="text-xs italic text-neutral-200 light:text-neutral-800">
                "{lenses.preMortemLens.diagnosticQuestion}"
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Outsider */}
        {activeLens === 'outsider' && (
          <div className="p-5 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 light:text-cyan-700 block">
              Perspective of: {lenses.outsiderLens.affectedStakeholder}
            </span>
            <p className="text-sm text-neutral-200 light:text-neutral-800 leading-relaxed">
              "{lenses.outsiderLens.probingQuestion}"
            </p>
          </div>
        )}

        {/* Tab 4: Opposite Steelman */}
        {activeLens === 'steelman' && (
          <div className="p-5 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-4">
            <div className="p-3 bg-neutral-900 light:bg-neutral-200 border border-neutral-800 light:border-neutral-300 rounded-lg text-xs text-neutral-400 light:text-neutral-600">
              <strong className="text-amber-400 light:text-amber-700">Guardrail Principle: </strong>
              Framed as "a case someone might make", never as advice or a recommendation.
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-neutral-400 light:text-neutral-500 block">
                Strongest Honest Case for the Unchosen Path:
              </span>
              <h4 className="text-sm font-bold text-white light:text-neutral-900">
                {lenses.oppositeSteelmanLens.counterOptionName}
              </h4>
              <p className="text-xs text-neutral-300 light:text-neutral-700 leading-relaxed pt-1">
                {lenses.oppositeSteelmanLens.steelmanCase}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 light:border-neutral-200 text-xs">
              <span className="font-bold text-amber-300 light:text-amber-800 block mb-1">Critical Inquiry:</span>
              <p className="italic text-neutral-200 light:text-neutral-800">
                "{lenses.oppositeSteelmanLens.criticalQuestion}"
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
});

export default ConflictsAndLenses;
