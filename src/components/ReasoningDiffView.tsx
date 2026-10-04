/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReasoningDiff } from '../../shared/types.js';
import { GitCompare, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';

interface ReasoningDiffViewProps {
  diff: ReasoningDiff;
  onDismiss: () => void;
}

export const ReasoningDiffView: React.FC<ReasoningDiffViewProps> = ({ diff, onDismiss }) => {
  return (
    <section aria-labelledby="diff-heading" className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-cyan-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur relative">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <GitCompare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="diff-heading" className="text-base sm:text-lg font-bold text-white tracking-tight">
              Reasoning Evolution Diff
            </h3>
            <p className="text-xs text-neutral-400">
              Comparing your thinking from Run 1 to Run 2
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition"
        >
          Dismiss Diff
        </button>
      </div>

      {/* Summary Narrative */}
      <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs leading-relaxed mb-6 font-medium">
        {diff.summary}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Closed Attention Gaps */}
        <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>Closed Attention Gaps ({diff.closedGaps.length})</span>
          </div>
          {diff.closedGaps.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">No previous gaps closed yet.</p>
          ) : (
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {diff.closedGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tested / Resolved Assumptions */}
        <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>Resolved Assumptions ({diff.resolvedAssumptions.length})</span>
          </div>
          {diff.resolvedAssumptions.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">No assumptions marked resolved.</p>
          ) : (
            <ul className="space-y-1.5 text-xs text-neutral-300">
              {diff.resolvedAssumptions.map((assump, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="line-through text-neutral-400">{assump}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Claim Ratio Shifts */}
        <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>Epistemic Ratio Shift</span>
          </div>
          <div className="space-y-2 pt-1 text-xs">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>Facts Ratio:</span>
                <span className="font-mono text-emerald-300">
                  {diff.claimRatioShift.previousFactRatio}% → {diff.claimRatioShift.currentFactRatio}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>Assumptions Ratio:</span>
                <span className="font-mono text-rose-300">
                  {diff.claimRatioShift.previousAssumptionRatio}% → {diff.claimRatioShift.currentAssumptionRatio}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
