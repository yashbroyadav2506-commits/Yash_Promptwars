/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { ThinkingShiftDiff } from '../utils/diffCalculator.js';
import { 
  GitCompare, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  GitFork, 
  Layers, 
  X,
  TrendingUp
} from 'lucide-react';

interface ThinkingShiftDiffViewProps {
  diff: ThinkingShiftDiff;
  onDismiss: () => void;
}

export const ThinkingShiftDiffView: React.FC<ThinkingShiftDiffViewProps> = memo(({
  diff,
  onDismiss
}) => {
  return (
    <section 
      aria-labelledby="thinking-shift-title"
      className="bg-neutral-900/90 dark:bg-neutral-900/90 light:bg-white border-2 border-cyan-500/50 light:border-cyan-400 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl space-y-6 relative transition-colors"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 light:border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 light:bg-cyan-100 border border-cyan-400/50 flex items-center justify-center text-cyan-300 light:text-cyan-800">
            <GitCompare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 light:text-cyan-700 bg-cyan-950/60 light:bg-cyan-100 px-2 py-0.5 rounded border border-cyan-500/30">
                Reasoning Diff
              </span>
            </div>
            <h3 id="thinking-shift-title" className="text-lg sm:text-xl font-bold tracking-tight text-white light:text-neutral-900 mt-0.5">
              How Your Thinking Shifted
            </h3>
            <p className="text-xs text-neutral-400 light:text-neutral-500">
              A neutral comparison of your reasoning distribution before and after reflection. No scores or value judgments.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-neutral-400 hover:text-neutral-200 light:hover:text-neutral-900 p-2 rounded-lg border border-neutral-800 light:border-neutral-200 hover:bg-neutral-800 light:hover:bg-neutral-100 transition flex items-center gap-1.5"
          aria-label="Dismiss reasoning diff"
        >
          <X className="w-4 h-4" />
          <span>Dismiss</span>
        </button>
      </div>

      {/* Narrative Headline */}
      <div className="p-4 bg-cyan-950/30 light:bg-cyan-50 border border-cyan-500/30 light:border-cyan-200 rounded-xl text-cyan-200 light:text-cyan-900 text-xs sm:text-sm font-medium leading-relaxed">
        {diff.headlineSummary}
      </div>

      {/* 3 Core Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Gaps that Narrowed */}
        <div className="p-5 bg-neutral-950/60 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-800 light:border-neutral-200 pb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 light:text-emerald-700">
              Gaps That Narrowed ({diff.narrowedGaps.length})
            </h4>
          </div>

          {diff.narrowedGaps.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-2">
              No previous attention gaps narrowed in this iteration.
            </p>
          ) : (
            <div className="space-y-3">
              {diff.narrowedGaps.map((gap) => (
                <div key={gap.id} className="p-3 bg-neutral-900 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-neutral-100 light:text-neutral-900">
                    <span>{gap.name}</span>
                    <span className="font-mono text-emerald-400 light:text-emerald-700 font-semibold text-[11px]">
                      +{gap.deltaAirtime}% airtime
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-300 light:text-neutral-700 bg-neutral-950/50 light:bg-neutral-100 p-1.5 rounded">
                    <span>Before: <strong>{gap.beforeAirtime}%</strong></span>
                    <ArrowRight className="w-3 h-3 text-neutral-500" />
                    <span>After: <strong className="text-emerald-400 light:text-emerald-700">{gap.afterAirtime}%</strong></span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-sans block">
                    AI estimate, not a measurement
                  </span>

                  <p className="text-[11px] text-neutral-400 light:text-neutral-600">
                    {gap.notes}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Assumptions Addressed */}
        <div className="p-5 bg-neutral-950/60 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-800 light:border-neutral-200 pb-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 light:text-cyan-700">
              Assumptions Addressed ({diff.addressedAssumptions.length})
            </h4>
          </div>

          {diff.addressedAssumptions.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-2">
              No previous assumptions marked addressed or resolved yet.
            </p>
          ) : (
            <div className="space-y-3">
              {diff.addressedAssumptions.map((assump) => (
                <div key={assump.id} className="p-3 bg-neutral-900 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-neutral-200 light:text-neutral-900 leading-snug">
                    "{assump.statement}"
                  </p>
                  <p className="text-[11px] text-cyan-400 light:text-cyan-800 italic">
                    {assump.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel 3: New Assumptions or Conflicts That Appeared */}
        <div className="p-5 bg-neutral-950/60 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-neutral-800 light:border-neutral-200 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 light:text-amber-700">
              New Assumptions & Conflicts ({diff.newAssumptions.length + diff.newConflicts.length})
            </h4>
          </div>

          {diff.newAssumptions.length === 0 && diff.newConflicts.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-2">
              No new unexamined assumptions or conflicts surfaced in this revision.
            </p>
          ) : (
            <div className="space-y-3">
              {diff.newAssumptions.map((na) => (
                <div key={na.id} className="p-3 bg-neutral-900 light:bg-white border border-amber-500/30 light:border-amber-200 rounded-lg text-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-400 light:text-rose-700 block">
                    New Assumption Surfaced:
                  </span>
                  <p className="font-semibold text-neutral-100 light:text-neutral-900">
                    "{na.statement}"
                  </p>
                  <p className="text-[11px] text-neutral-400 light:text-neutral-600">
                    <strong>Vulnerability:</strong> {na.vulnerability}
                  </p>
                </div>
              ))}

              {diff.newConflicts.map((nc) => (
                <div key={nc.id} className="p-3 bg-neutral-900 light:bg-white border border-purple-500/30 light:border-purple-200 rounded-lg text-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-400 light:text-purple-700 block flex items-center gap-1">
                    <GitFork className="w-3 h-3" />
                    <span>New Tension Surfaced:</span>
                  </span>
                  <p className="text-[11px] text-neutral-300 light:text-neutral-700 italic">
                    "{nc.valueQuote}" vs "{nc.reasonQuote}"
                  </p>
                  <p className="text-[11px] text-neutral-400 light:text-neutral-600">
                    {nc.tensionAnalysis}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Claim Counts & Volume Shift Bar */}
      <div className="p-4 bg-neutral-950/40 light:bg-neutral-100 border border-neutral-800 light:border-neutral-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-400 light:text-neutral-600">
        <div>
          <span>Text volume: </span>
          <strong className="text-neutral-100 light:text-neutral-900">{diff.claimShifts.previousWords} words</strong>
          <ArrowRight className="inline w-3 h-3 mx-1 text-neutral-500" />
          <strong className="text-neutral-100 light:text-neutral-900">{diff.claimShifts.currentWords} words</strong>
        </div>

        <div>
          <span>Facts tagged: </span>
          <strong className="text-emerald-400 light:text-emerald-700">{diff.claimShifts.previousFacts}</strong>
          <ArrowRight className="inline w-3 h-3 mx-1 text-neutral-500" />
          <strong className="text-emerald-400 light:text-emerald-700">{diff.claimShifts.currentFacts}</strong>
        </div>

        <div>
          <span>Assumptions tagged: </span>
          <strong className="text-rose-400 light:text-rose-700">{diff.claimShifts.previousAssumptions}</strong>
          <ArrowRight className="inline w-3 h-3 mx-1 text-neutral-500" />
          <strong className="text-rose-400 light:text-rose-700">{diff.claimShifts.currentAssumptions}</strong>
        </div>
      </div>
    </section>
  );
});

export default ThinkingShiftDiffView;
