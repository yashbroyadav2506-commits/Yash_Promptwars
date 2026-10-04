/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { HiddenAssumption } from '../schemas/xraySchemas.js';
import { AlertCircle, Clock, CheckSquare, Square } from 'lucide-react';

interface AssumptionsAuditProps {
  assumptions: HiddenAssumption[];
  testedAssumptions: Record<string, boolean>;
  onToggleTested: (id: string) => void;
  plainLanguage?: boolean;
}

export const AssumptionsAudit: React.FC<AssumptionsAuditProps> = memo(({
  assumptions,
  testedAssumptions,
  onToggleTested,
  plainLanguage = false
}) => {
  return (
    <section aria-labelledby="assumptions-title" className="bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl transition-colors">
      <div className="mb-6">
        <span className="text-xs uppercase font-mono font-bold text-rose-400 light:text-rose-600">
          {plainLanguage ? 'Hidden Assumptions' : 'Hidden Assumption Audit'}
        </span>
        <h3 id="assumptions-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-neutral-900 mt-1 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-rose-400" aria-hidden="true" />
          <span>Unstated Assumptions & Cheapest 72-Hour Tests</span>
        </h3>
        <p className="text-sm text-neutral-400 light:text-neutral-600 mt-1">
          Assumptions treated as facts are the most common source of regret. Here is why each might be shaky, and the fastest low-cost way to test it before deciding.
        </p>
      </div>

      <div className="space-y-4">
        {assumptions.map((ha) => {
          const isTested = !!testedAssumptions[ha.id];
          return (
            <div
              key={ha.id}
              className={`p-5 rounded-xl border transition ${
                isTested
                  ? 'bg-neutral-950/40 light:bg-neutral-100 border-emerald-900/50 light:border-emerald-300 opacity-80'
                  : 'bg-neutral-950/70 light:bg-neutral-50 border-neutral-800 light:border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-rose-400 light:text-rose-600">ASSUMPTION:</span>
                    <h4 className="text-sm font-bold text-neutral-100 light:text-neutral-900">{ha.statement}</h4>
                  </div>

                  {ha.sourceQuote && (
                    <p className="text-xs text-neutral-400 light:text-neutral-500 italic pl-3 border-l border-neutral-800 light:border-neutral-300">
                      Rooted in: "{ha.sourceQuote}"
                    </p>
                  )}

                  <div className="p-3 bg-neutral-900/80 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-lg text-xs space-y-1">
                    <span className="text-neutral-400 light:text-neutral-600 font-bold block text-[11px] uppercase tracking-wider">
                      Why it might be shaky:
                    </span>
                    <p className="text-neutral-200 light:text-neutral-800 leading-relaxed">{ha.vulnerability}</p>
                  </div>

                  <div className="p-3 bg-emerald-950/30 light:bg-emerald-50 border border-emerald-800/40 light:border-emerald-200 rounded-lg text-xs space-y-1">
                    <span className="text-emerald-400 light:text-emerald-700 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Cheapest Way to Test It This Week (&lt;72 Hours):</span>
                    </span>
                    <p className="text-emerald-200 light:text-emerald-900 font-medium leading-relaxed">{ha.cheapestTest}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleTested(ha.id)}
                  className={`shrink-0 p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    isTested
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 light:bg-emerald-100 light:border-emerald-600 light:text-emerald-900'
                      : 'bg-neutral-900 light:bg-neutral-200 border-neutral-700 light:border-neutral-300 text-neutral-300 light:text-neutral-700 hover:text-white'
                  }`}
                  aria-pressed={isTested}
                  aria-label={`Mark assumption "${ha.statement}" as tested`}
                >
                  {isTested ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                  <span>{isTested ? 'Tested' : 'Mark Tested'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

export default AssumptionsAudit;
