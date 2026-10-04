/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  XRayAnalysis, 
  ClaimType, 
  AttentionDimension, 
  HiddenAssumption, 
  InternalConflict 
} from '../../shared/types.js';
import { 
  BarChart3, 
  HelpCircle, 
  AlertTriangle, 
  GitFork, 
  Compass, 
  Table as TableIcon, 
  ListFilter, 
  CheckSquare, 
  Square, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  FileQuestion,
  CornerDownRight
} from 'lucide-react';

interface XRayLayersProps {
  analysis: XRayAnalysis;
  plainLanguage: boolean;
  userReflections: Record<string, string>;
  onUpdateReflection: (questionIndex: number, text: string) => void;
  testedAssumptions: Record<string, boolean>;
  onToggleTestedAssumption: (id: string) => void;
  onOpenExportModal: () => void;
}

export const XRayLayers: React.FC<XRayLayersProps> = ({
  analysis,
  plainLanguage,
  userReflections,
  onUpdateReflection,
  testedAssumptions,
  onToggleTestedAssumption,
  onOpenExportModal
}) => {
  const [selectedClaimType, setSelectedClaimType] = useState<string>('ALL');
  const [showAccessibleTable, setShowAccessibleTable] = useState(false);
  const [activeLensTab, setActiveLensTab] = useState<'future' | 'premortem' | 'outsider' | 'steelman'>('future');
  const [expandedConflicts, setExpandedConflicts] = useState<Record<string, boolean>>({});

  const toggleConflictExpand = (id: string) => {
    setExpandedConflicts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredClaims = selectedClaimType === 'ALL'
    ? analysis.claims
    : analysis.claims.filter(c => c.type === selectedClaimType);

  const majorGaps = analysis.attentionMap.filter(d => d.isGap);

  return (
    <div className="space-y-10" id="main-content" tabIndex={-1}>
      {/* Overview Metric Banner */}
      <section aria-label="Reasoning X-Ray Overview" className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" aria-hidden="true"></span>
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-cyan-400">
                {plainLanguage ? 'Reasoning Breakdown' : 'Reasoning Architecture Audit'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              "{analysis.decisionTitle}"
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Evaluated {analysis.stats.totalWords} words • Generated {new Date(analysis.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold rounded-xl border border-neutral-700 transition flex items-center gap-2"
          >
            <span>Export Reflection Document</span>
          </button>
        </div>

        {/* Diagnostic Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-xs text-neutral-400 block font-medium">Attention Gaps</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {majorGaps.length}
              </span>
              <span className="text-xs text-neutral-500">high weight / low text</span>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-xs text-neutral-400 block font-medium">Unverified Assumptions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-rose-400 font-mono">
                {analysis.hiddenAssumptions.length}
              </span>
              <span className="text-xs text-neutral-500">testable</span>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-xs text-neutral-400 block font-medium">Internal Tensions</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">
                {analysis.internalConflicts.length}
              </span>
              <span className="text-xs text-neutral-500">value vs reason</span>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-xl">
            <span className="text-xs text-neutral-400 block font-medium">Open Inquiries</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {analysis.questionsToSitWith.length}
              </span>
              <span className="text-xs text-neutral-500">non-leading</span>
            </div>
          </div>
        </div>

        {analysis.isThinInput && (
          <div role="alert" className="mt-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Epistemic Humility Notice:</span>
              <span>{analysis.thinInputNotice || 'Your input details are relatively brief. The X-Ray provides diagnostic questions, but adding concrete details will yield deeper blindspot mapping.'}</span>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* LAYER B: THE ATTENTION MAP (Signature Feature - Placed high for impact) */}
      {/* ============================================================== */}
      <section aria-labelledby="layer-b-heading" className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-semibold text-amber-400">
                {plainLanguage ? 'Layer 1: Where Your Focus Went' : 'Layer B: Attention Map (Signature Metric)'}
              </span>
            </div>
            <h3 id="layer-b-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-400" aria-hidden="true" />
              <span>Cognitive Attention vs. Likely Decision Weight</span>
            </h3>
            <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
              {plainLanguage
                ? 'People decide badly because the most visible factors get all the attention. This compares how much you wrote about a topic vs how much it typically matters.'
                : 'Audits information distribution. Blue striped bars show "Airtime" (% of text dedicated to each dimension). Orange dotted bars show "Likely Weight" (heuristic importance for this decision class).'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAccessibleTable(!showAccessibleTable)}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition"
              aria-expanded={showAccessibleTable}
              aria-controls="attention-map-table"
            >
              <TableIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showAccessibleTable ? 'Show Graphical View' : 'Accessible Table & Screen-Reader View'}</span>
            </button>
          </div>
        </div>

        {/* Legend with pattern recognition (Non-color reliant WCAG compliance) */}
        <div className="flex flex-wrap items-center gap-6 p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs text-neutral-300 mb-6" role="region" aria-label="Map Legend">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-cyan-400/40 pattern-stripes-airtime bg-cyan-950/60" aria-hidden="true"></div>
            <span><strong>Your Airtime</strong> (% of user words)</span>
            <span className="text-neutral-500 font-mono text-[10px]">[AI estimate]</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-amber-500/40 pattern-dots-weight bg-amber-950/60" aria-hidden="true"></div>
            <span><strong>Likely Weight</strong> (heuristic impact)</span>
            <span className="text-neutral-500 font-mono text-[10px]">[Heuristic baseline]</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              High-Risk Gap
            </span>
            <span className="text-neutral-400">High weight, neglected words</span>
          </div>
        </div>

        {/* Screen-Reader Plain Language Summary */}
        <div className="sr-only" aria-live="polite">
          <h4>Attention Map Summary for Screen Readers</h4>
          <p>
            Your analysis identified {majorGaps.length} attention gaps where a dimension has high typical importance but received low textual focus in your write-up.
            {majorGaps.map(g => `${g.name} has ${g.airtime}% airtime compared to ${g.likelyWeight}% estimated importance.`).join(' ')}
          </p>
        </div>

        {/* View 1: Accessible Full HTML Table */}
        {showAccessibleTable ? (
          <div id="attention-map-table" className="overflow-x-auto border border-neutral-800 rounded-xl">
            <table className="w-full text-left text-sm text-neutral-200">
              <caption className="p-3 text-left font-semibold text-neutral-300 bg-neutral-950/80 border-b border-neutral-800 text-xs">
                Comprehensive Attention Map Comparison: Dimension, Textual Airtime, Heuristic Weight, Gap Flag, and Suggested Inquiry.
              </caption>
              <thead className="bg-neutral-950 text-xs uppercase font-mono text-neutral-400">
                <tr>
                  <th scope="col" className="p-3">Dimension</th>
                  <th scope="col" className="p-3">Airtime (% words)</th>
                  <th scope="col" className="p-3">Likely Weight (%)</th>
                  <th scope="col" className="p-3">Gap Status</th>
                  <th scope="col" className="p-3">Gap Analysis & Inquiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-900/40 text-xs">
                {analysis.attentionMap.map((dim) => (
                  <tr key={dim.id} className={dim.isGap ? 'bg-amber-500/5' : ''}>
                    <th scope="row" className="p-3 font-semibold text-neutral-100">
                      {dim.name}
                      <span className="block text-[11px] font-normal text-neutral-400 mt-0.5">{dim.description}</span>
                    </th>
                    <td className="p-3 font-mono font-bold text-cyan-300">{dim.airtime}%</td>
                    <td className="p-3 font-mono font-bold text-amber-300">{dim.likelyWeight}%</td>
                    <td className="p-3">
                      {dim.isGap ? (
                        <span className="px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Gap (Neglected)
                        </span>
                      ) : (
                        <span className="text-neutral-500 font-medium">Covered</span>
                      )}
                    </td>
                    <td className="p-3 max-w-md">
                      <p className="text-neutral-300">{dim.gapRationale}</p>
                      <p className="text-neutral-400 italic mt-1">Inquiry: "{dim.suggestedInquiry}"</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* View 2: High-contrast Graphic Visualizer with Text & Pattern indicators */
          <div className="space-y-4">
            {analysis.attentionMap.map((dim) => {
              const isGap = dim.isGap;
              return (
                <div
                  key={dim.id}
                  className={`p-4 rounded-xl border transition ${
                    isGap
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-sm shadow-amber-500/5'
                      : 'bg-neutral-950/50 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-neutral-100">{dim.name}</h4>
                        {isGap && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Blind Spot Gap</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{dim.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-neutral-500 block text-[10px] uppercase">Airtime</span>
                        <span className="font-bold text-cyan-300">{dim.airtime}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-500 block text-[10px] uppercase">Weight</span>
                        <span className="font-bold text-amber-400">{dim.likelyWeight}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual comparative visual track */}
                  <div className="space-y-1.5 mb-3" aria-hidden="true">
                    {/* Airtime bar */}
                    <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-neutral-800 flex">
                      <div
                        className="h-full bg-cyan-500/40 pattern-stripes-airtime border-r-2 border-cyan-400 transition-all duration-500"
                        style={{ width: `${Math.max(2, Math.min(100, dim.airtime))}%` }}
                        title={`Airtime: ${dim.airtime}%`}
                      ></div>
                    </div>
                    {/* Likely weight bar */}
                    <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-neutral-800 flex">
                      <div
                        className="h-full bg-amber-500/40 pattern-dots-weight border-r-2 border-amber-400 transition-all duration-500"
                        style={{ width: `${Math.max(2, Math.min(100, dim.likelyWeight))}%` }}
                        title={`Likely weight: ${dim.likelyWeight}%`}
                      ></div>
                    </div>
                  </div>

                  {/* Gap Rationale & Suggested Inquiry */}
                  <div className="text-xs pt-2 border-t border-neutral-800/60 space-y-1">
                    <p className="text-neutral-300 leading-relaxed">
                      <span className="text-neutral-400 font-medium">Why this matters: </span>
                      {dim.gapRationale}
                    </p>
                    <p className="text-amber-200/90 italic flex items-start gap-1.5 pt-0.5">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
                      <span>Inquiry: "{dim.suggestedInquiry}"</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* LAYER A: REASONING EXTRACTION */}
      {/* ============================================================== */}
      <section aria-labelledby="layer-a-heading" className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase font-mono font-semibold text-cyan-400">
              {plainLanguage ? 'Layer 2: Statements You Made' : 'Layer A: Epistemic Reasoning Extraction'}
            </span>
            <h3 id="layer-a-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <Layers className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              <span>Deconstructed Claims & Epistemic Tags</span>
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
              Separates what is objectively verified from subjective values, unexamined assumptions, and future forecasts.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter claims by category">
            {(
              [
                { id: 'ALL', label: 'All Claims', count: analysis.claims.length },
                { id: 'FACT', label: 'Facts', count: analysis.stats.claimCounts.FACT },
                { id: 'ASSUMPTION', label: 'Assumptions', count: analysis.stats.claimCounts.ASSUMPTION },
                { id: 'VALUE/PREFERENCE', label: 'Values', count: analysis.stats.claimCounts['VALUE/PREFERENCE'] },
                { id: 'PREDICTION', label: 'Predictions', count: analysis.stats.claimCounts.PREDICTION },
              ] as const
            ).map(({ id, label, count }) => (
              <button
                type="button"
                key={id}
                onClick={() => setSelectedClaimType(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                  selectedClaimType === id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
                aria-pressed={selectedClaimType === id}
              >
                <span>{label}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-neutral-800 text-neutral-300">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClaims.map((claim) => {
            const badgeClasses: Record<ClaimType, string> = {
              FACT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
              ASSUMPTION: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
              'VALUE/PREFERENCE': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
              PREDICTION: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            };

            return (
              <div
                key={claim.id}
                className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2 hover:border-neutral-700 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeClasses[claim.type]}`}>
                    {claim.type}
                  </span>
                </div>

                <blockquote className="text-xs italic text-neutral-400 border-l-2 border-neutral-700 pl-3 my-1">
                  "{claim.quote}"
                </blockquote>

                <p className="text-xs font-semibold text-neutral-200">
                  {claim.statement}
                </p>

                {claim.epistemicNote && (
                  <p className="text-[11px] text-neutral-500">
                    <span className="font-mono text-neutral-400">Epistemic Status:</span> {claim.epistemicNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* LAYER C: HIDDEN ASSUMPTION AUDIT */}
      {/* ============================================================== */}
      <section aria-labelledby="layer-c-heading" className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase font-mono font-semibold text-rose-400">
              {plainLanguage ? 'Layer 3: Hidden Assumptions' : 'Layer C: Hidden Assumption Audit'}
            </span>
            <h3 id="layer-c-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-400" aria-hidden="true" />
              <span>Unstated Assumptions & 72-Hour Stress Tests</span>
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
              Assumptions disguised as facts are the #1 cause of decision failure. Below is the fastest, cheapest way to test each one before locking in.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {analysis.hiddenAssumptions.map((ha) => {
            const isTested = !!testedAssumptions[ha.id];
            return (
              <div
                key={ha.id}
                className={`p-5 rounded-xl border transition ${
                  isTested
                    ? 'bg-neutral-950/40 border-emerald-900/40 opacity-75'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-400">ASSUMPTION:</span>
                      <h4 className="text-sm font-semibold text-neutral-100">{ha.statement}</h4>
                    </div>

                    {ha.sourceQuote && (
                      <p className="text-xs text-neutral-500 italic pl-3 border-l border-neutral-800">
                        Implied in your text: "{ha.sourceQuote}"
                      </p>
                    )}

                    <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg text-xs space-y-1">
                      <span className="text-neutral-400 font-semibold block text-[11px] uppercase tracking-wider">
                        Why it might be shaky:
                      </span>
                      <p className="text-neutral-300">{ha.vulnerability}</p>
                    </div>

                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs space-y-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Cheapest Way to Test It This Week (&lt;72 Hours):</span>
                      </span>
                      <p className="text-emerald-200/90 font-medium">{ha.cheapestTest}</p>
                    </div>
                  </div>

                  {/* Mark as tested toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleTestedAssumption(ha.id)}
                    className={`shrink-0 p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
                      isTested
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
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

      {/* ============================================================== */}
      {/* LAYER D: INTERNAL CONFLICT DETECTOR */}
      {/* ============================================================== */}
      <section aria-labelledby="layer-d-heading" className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="mb-6">
          <span className="text-xs uppercase font-mono font-semibold text-purple-400">
            {plainLanguage ? 'Layer 4: Values vs Reasons' : 'Layer D: Internal Conflict Detector'}
          </span>
          <h3 id="layer-d-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-purple-400" aria-hidden="true" />
            <span>Stated Values vs. Stated Leaning Tensions</span>
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            Phrased neutrally and non-judgmentally: these are contradictions where your stated core aspirations pull against the tactical reasons you are leaning toward.
          </p>
        </div>

        {analysis.internalConflicts.length === 0 ? (
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl text-neutral-400 text-xs">
            No severe internal contradictions detected between your stated values and stated reasons.
          </div>
        ) : (
          <div className="space-y-4">
            {analysis.internalConflicts.map((conflict) => {
              const isExpanded = expandedConflicts[conflict.id] ?? true;
              return (
                <div key={conflict.id} className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: What you said you value */}
                    <div className="p-3.5 bg-neutral-900/70 border border-purple-500/30 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-purple-400 block">
                        Stated Goal or Value (Your Words)
                      </span>
                      <blockquote className="text-xs italic text-neutral-200">
                        "{conflict.valueQuote}"
                      </blockquote>
                    </div>

                    {/* Right: What you said you are leaning toward */}
                    <div className="p-3.5 bg-neutral-900/70 border border-amber-500/30 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-amber-400 block">
                        Stated Leaning Reason (Your Words)
                      </span>
                      <blockquote className="text-xs italic text-neutral-200">
                        "{conflict.reasonQuote}"
                      </blockquote>
                    </div>
                  </div>

                  <div className="p-3.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-xs space-y-2">
                    <p className="text-neutral-300 leading-relaxed">
                      <strong className="text-neutral-200">Tension Analysis:</strong> {conflict.tensionAnalysis}
                    </p>
                    <p className="text-cyan-300 italic pt-1 border-t border-neutral-800/80">
                      <strong>Clarifying Inquiry:</strong> "{conflict.inquiry}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* LAYER E: PERSPECTIVE SHIFT LENSES */}
      {/* ============================================================== */}
      <section aria-labelledby="layer-e-heading" className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="mb-6">
          <span className="text-xs uppercase font-mono font-semibold text-emerald-400">
            {plainLanguage ? 'Layer 5: Other Angles' : 'Layer E: Perspective Shift Lenses'}
          </span>
          <h3 id="layer-e-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            <span>Four Diagnostic Cognitive Angles</span>
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            Questions framed from distinct vantage points to shake unexamined tunnel vision.
          </p>
        </div>

        {/* Lens Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3 mb-6" role="tablist" aria-label="Perspective lenses">
          {(
            [
              { id: 'future', label: 'Future-Self Lens (6m / 5y)' },
              { id: 'premortem', label: 'Pre-Mortem Lens (Failure Post-Mortem)' },
              { id: 'outsider', label: 'Outsider Stakeholder Lens' },
              { id: 'steelman', label: 'Opposite-Steelman Lens' },
            ] as const
          ).map(({ id, label }) => (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={activeLensTab === id}
              aria-controls={`lens-panel-${id}`}
              id={`lens-tab-${id}`}
              onClick={() => setActiveLensTab(id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                activeLensTab === id
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab 1: Future Self */}
        {activeLensTab === 'future' && (
          <div id="lens-panel-future" role="tabpanel" aria-labelledby="lens-tab-future" className="space-y-4">
            <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 block">6 Months Later:</span>
              <p className="text-sm text-neutral-200 leading-relaxed">
                {analysis.perspectiveLenses.futureSelfLens.sixMonths}
              </p>
            </div>
            <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 block">5 Years Later:</span>
              <p className="text-sm text-neutral-200 leading-relaxed">
                {analysis.perspectiveLenses.futureSelfLens.fiveYears}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Pre-Mortem */}
        {activeLensTab === 'premortem' && (
          <div id="lens-panel-premortem" role="tabpanel" aria-labelledby="lens-tab-premortem" className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-rose-400 block mb-1">
                Post-Mortem Scenario (Assuming It Went Badly):
              </span>
              <p className="text-sm text-neutral-200 leading-relaxed">
                {analysis.perspectiveLenses.preMortemLens.scenarioDescription}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-neutral-400 block mb-2">Most likely weak links:</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
                {analysis.perspectiveLenses.preMortemLens.vulnerablePoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <span className="text-xs font-bold text-amber-300 block mb-1">Diagnostic Question:</span>
              <p className="text-xs italic text-neutral-200">
                "{analysis.perspectiveLenses.preMortemLens.diagnosticQuestion}"
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Outsider */}
        {activeLensTab === 'outsider' && (
          <div id="lens-panel-outsider" role="tabpanel" aria-labelledby="lens-tab-outsider" className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 block">
              Perspective of: {analysis.perspectiveLenses.outsiderLens.affectedStakeholder}
            </span>
            <p className="text-sm text-neutral-200 leading-relaxed">
              "{analysis.perspectiveLenses.outsiderLens.probingQuestion}"
            </p>
          </div>
        )}

        {/* Tab 4: Opposite Steelman */}
        {activeLensTab === 'steelman' && (
          <div id="lens-panel-steelman" role="tabpanel" aria-labelledby="lens-tab-steelman" className="p-5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-amber-400">Guardrail Note:</span>
              <span>This is NOT advice to take this option. It is the strongest rational case for the option you are leaning away from.</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-neutral-400 block">Alternative Option Steelman:</span>
              <h4 className="text-sm font-bold text-white">
                {analysis.perspectiveLenses.oppositeSteelmanLens.counterOptionName}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                {analysis.perspectiveLenses.oppositeSteelmanLens.steelmanCase}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-xs">
              <span className="font-bold text-amber-300 block mb-1">Critical Question to Answer:</span>
              <p className="italic text-neutral-200">
                "{analysis.perspectiveLenses.oppositeSteelmanLens.criticalQuestion}"
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* LAYER F: QUESTIONS TO SIT WITH */}
      {/* ============================================================== */}
      <section aria-labelledby="layer-f-heading" className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="mb-6">
          <span className="text-xs uppercase font-mono font-semibold text-amber-400">
            {plainLanguage ? 'Layer 6: Open Questions' : 'Layer F: Questions to Sit With'}
          </span>
          <h3 id="layer-f-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-amber-400" aria-hidden="true" />
            <span>Open, Non-Leading Inquiries</span>
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            No yes/no answers. Jot your thoughts into the reflection boxes below to update your write-up for a re-run.
          </p>
        </div>

        <div className="space-y-4">
          {analysis.questionsToSitWith.map((q, idx) => (
            <div key={idx} className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-amber-400 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-neutral-100 flex-1 leading-snug">
                  {q}
                </p>
              </div>

              {/* In-situ user journal answer field */}
              <div className="pl-9">
                <label htmlFor={`reflection-${idx}`} className="sr-only">
                  Your reflection on question {idx + 1}
                </label>
                <textarea
                  id={`reflection-${idx}`}
                  rows={2}
                  value={userReflections[`q-${idx}`] || ''}
                  onChange={(e) => onUpdateReflection(idx, e.target.value)}
                  placeholder="Record your immediate thoughts or test results here..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
