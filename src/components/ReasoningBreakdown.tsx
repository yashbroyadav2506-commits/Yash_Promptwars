/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, memo } from 'react';
import { ReasoningClaim, ClaimType } from '../schemas/xraySchemas.js';
import { Layers } from 'lucide-react';

interface ReasoningBreakdownProps {
  claims: ReasoningClaim[];
  plainLanguage?: boolean;
}

export const ReasoningBreakdown: React.FC<ReasoningBreakdownProps> = memo(({
  claims,
  plainLanguage = false
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filtered = activeFilter === 'ALL'
    ? claims
    : claims.filter(c => c.type === activeFilter);

  const counts: Record<ClaimType, number> = {
    FACT: claims.filter(c => c.type === 'FACT').length,
    ASSUMPTION: claims.filter(c => c.type === 'ASSUMPTION').length,
    VALUE: claims.filter(c => c.type === 'VALUE').length,
    PREDICTION: claims.filter(c => c.type === 'PREDICTION').length,
  };

  const badgeStyles: Record<ClaimType, string> = {
    FACT: 'bg-emerald-500/15 text-emerald-400 light:text-emerald-700 border-emerald-500/30',
    ASSUMPTION: 'bg-rose-500/15 text-rose-400 light:text-rose-700 border-rose-500/30',
    VALUE: 'bg-purple-500/15 text-purple-400 light:text-purple-700 border-purple-500/30',
    PREDICTION: 'bg-amber-500/15 text-amber-400 light:text-amber-700 border-amber-500/30',
  };

  return (
    <section aria-labelledby="reasoning-breakdown-title" className="bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-cyan-400 light:text-cyan-600">
            {plainLanguage ? 'Deconstructed Claims' : 'Reasoning Breakdown'}
          </span>
          <h3 id="reasoning-breakdown-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-neutral-900 mt-1 flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            <span>Claims Tagged: FACT / ASSUMPTION / VALUE / PREDICTION</span>
          </h3>
          <p className="text-sm text-neutral-400 light:text-neutral-600 mt-1">
            Separating verifiable reality from unverified assumptions, personal values, and future predictions.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter claims by tag">
          {(
            [
              { id: 'ALL', label: 'All', count: claims.length },
              { id: 'FACT', label: 'Facts', count: counts.FACT },
              { id: 'ASSUMPTION', label: 'Assumptions', count: counts.ASSUMPTION },
              { id: 'VALUE', label: 'Values', count: counts.VALUE },
              { id: 'PREDICTION', label: 'Predictions', count: counts.PREDICTION },
            ] as const
          ).map(({ id, label, count }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                activeFilter === id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 light:bg-cyan-100 light:border-cyan-500 light:text-cyan-900'
                  : 'bg-neutral-950/60 light:bg-neutral-100 border-neutral-800 light:border-neutral-300 text-neutral-400 light:text-neutral-600 hover:text-neutral-200'
              }`}
              aria-pressed={activeFilter === id}
            >
              <span>{label}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-neutral-800 light:bg-neutral-200 text-neutral-300 light:text-neutral-800">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((claim) => (
          <div
            key={claim.id}
            className="p-4 bg-neutral-950/60 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-2 hover:border-neutral-700 light:hover:border-neutral-300 transition"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeStyles[claim.type]}`}>
                {claim.type}
              </span>
            </div>

            <blockquote className="text-xs italic text-neutral-400 light:text-neutral-600 border-l-2 border-neutral-700 light:border-neutral-300 pl-3 my-1">
              "{claim.quote}"
            </blockquote>

            <p className="text-xs font-semibold text-neutral-100 light:text-neutral-900 leading-snug">
              {claim.statement}
            </p>

            {claim.epistemicNote && (
              <p className="text-[11px] text-neutral-500 light:text-neutral-500">
                <span className="font-mono text-neutral-400 light:text-neutral-600 font-medium">Epistemic status:</span> {claim.epistemicNote}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
});

export default ReasoningBreakdown;
