/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, memo } from 'react';
import { AttentionDimension } from '../schemas/xraySchemas.js';
import { 
  BarChart2, 
  Table as TableIcon, 
  AlertTriangle, 
  CornerDownRight, 
  Sparkles, 
  HelpCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface AttentionMapProps {
  dimensions: AttentionDimension[];
  screenReaderSummary?: string;
  plainLanguage?: boolean;
}

/**
 * Maps a dimension to its unique tactile pattern class in index.css
 */
function getDimensionPatternClass(id: string, name: string): string {
  const key = `${id} ${name}`.toLowerCase();
  if (key.includes('money') || key.includes('finan') || key.includes('compens')) return 'pattern-dim-money';
  if (key.includes('time') || key.includes('energy') || key.includes('bandwidth')) return 'pattern-dim-time';
  if (key.includes('health') || key.includes('wellbeing') || key.includes('mental')) return 'pattern-dim-health';
  if (key.includes('learn') || key.includes('skill') || key.includes('mastery')) return 'pattern-dim-learning';
  if (key.includes('relat') || key.includes('social') || key.includes('family')) return 'pattern-dim-relationships';
  if (key.includes('revers') || key.includes('exit') || key.includes('rollback')) return 'pattern-dim-reversibility';
  if (key.includes('long') || key.includes('career') || key.includes('path') || key.includes('trajectory')) return 'pattern-dim-longterm';
  if (key.includes('opport') || key.includes('alternat')) return 'pattern-dim-opportunity';
  if (key.includes('people') || key.includes('affect') || key.includes('stakehold')) return 'pattern-dim-people';
  return 'pattern-dim-default';
}

/**
 * Generates an intuitive one-line data-grounded headline
 * e.g. "About 70% of your words are about money; 'learning' got 5%."
 */
function generateAttentionHeadline(dimensions: AttentionDimension[]): string {
  if (!dimensions || dimensions.length === 0) {
    return 'Attention distribution across core decision dimensions.';
  }

  // Sort by airtime descending
  const sortedByAirtime = [...dimensions].sort((a, b) => b.airtime - a.airtime);
  const topAirtime = sortedByAirtime[0];

  // Find the highest-severity gap (high weight, low airtime)
  const gaps = dimensions.filter(d => d.isGap);
  const sortedGaps = [...gaps].sort((a, b) => (b.likelyWeight - b.airtime) - (a.likelyWeight - a.airtime));
  const topGap = sortedGaps[0];

  if (topAirtime && topGap && topAirtime.id !== topGap.id) {
    return `About ${topAirtime.airtime}% of your words are about ${topAirtime.name.toLowerCase().split('&')[0].trim()}; '${topGap.name.toLowerCase().split('&')[0].trim()}' got ${topGap.airtime}%.`;
  }

  if (topAirtime) {
    const secondLowest = sortedByAirtime[sortedByAirtime.length - 1];
    return `About ${topAirtime.airtime}% of your words focused on ${topAirtime.name.toLowerCase().split('&')[0].trim()}; '${secondLowest.name.toLowerCase().split('&')[0].trim()}' received ${secondLowest.airtime}%.`;
  }

  return 'Cognitive attention evaluated across your decision text.';
}

export const AttentionMapComponent: React.FC<AttentionMapProps> = memo(({
  dimensions,
  screenReaderSummary,
  plainLanguage = false
}) => {
  const [showTable, setShowTable] = useState(false);
  const [focusedDimId, setFocusedDimId] = useState<string | null>(null);

  const majorGaps = dimensions.filter(d => d.isGap);
  const headline = generateAttentionHeadline(dimensions);

  return (
    <section 
      aria-labelledby="attention-map-title" 
      className="bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl transition-colors relative"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-amber-500 light:text-amber-600">
              {plainLanguage ? 'Where Your Words Went' : 'Attention Map (Signature Metric)'}
            </span>
          </div>
          <h3 id="attention-map-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-neutral-900 mt-1 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-amber-500" aria-hidden="true" />
            <span>Cognitive Airtime vs. Typical Decision Weight</span>
          </h3>
          <p className="text-sm text-neutral-400 light:text-neutral-600 mt-1 max-w-3xl leading-relaxed">
            {plainLanguage
              ? 'People decide badly because the most visible factors hog their attention. This compares how much you wrote about a topic vs how much it usually matters.'
              : 'Audits information distribution. Paired horizontal tracks contrast your written focus against heuristic baseline weights.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Skip link for keyboard users directly to data table */}
          <a
            href="#attention-map-accessible-table"
            className="sr-only focus:not-sr-only focus:p-2 bg-amber-500 text-neutral-950 font-bold rounded-lg text-xs z-20 shadow-md"
          >
            Jump to screen-reader data table
          </a>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="text-xs px-3.5 py-2 rounded-xl border border-neutral-700 light:border-neutral-300 bg-neutral-800 light:bg-neutral-100 hover:bg-neutral-700 light:hover:bg-neutral-200 text-neutral-200 light:text-neutral-800 flex items-center gap-2 transition font-medium"
            aria-expanded={showTable}
            aria-controls="attention-map-table-view"
          >
            <TableIcon className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>{showTable ? 'Switch to Graphic Bars View' : 'Switch to Visual Table View'}</span>
          </button>
        </div>
      </div>

      {/* Generated One-Line Data-Grounded Headline */}
      <div 
        role="status" 
        className="p-4 bg-amber-500/10 light:bg-amber-50 border border-amber-500/30 light:border-amber-300 rounded-xl flex items-start gap-3 my-5 shadow-sm"
      >
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-amber-500 light:text-amber-700 block mb-0.5">
            Key Attention Asymmetry
          </span>
          <p className="text-sm sm:text-base font-bold text-white light:text-neutral-900 tracking-tight leading-snug">
            "{headline}"
          </p>
        </div>
      </div>

      {/* Screen Reader Paragraph Summary (Always available to assistive technology) */}
      <div className="sr-only" aria-live="polite">
        <h4>Screen Reader Plain-Text Summary</h4>
        <p>
          {screenReaderSummary ||
            `Attention Map Analysis: ${headline} Identified ${majorGaps.length} attention gaps where typical importance exceeds your written text focus. High-risk gaps: ${majorGaps.map(g => `${g.name} has ${g.airtime}% airtime (AI estimate, not a measurement) versus ${g.likelyWeight}% typical weight (AI estimate, not a measurement)`).join('; ')}.`}
        </p>
      </div>

      {/* Tactile Legend with Pattern Previews */}
      <div 
        className="flex flex-wrap items-center gap-5 p-3.5 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl text-xs mb-6 text-neutral-300 light:text-neutral-700" 
        role="region" 
        aria-label="Map Visual & Pattern Legend"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-cyan-400/50 pattern-stripes-airtime bg-cyan-950/40" aria-hidden="true"></div>
          <span><strong>Airtime</strong> (% of your text)</span>
          <span className="text-[10px] font-mono text-neutral-400 italic">AI estimate, not a measurement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-amber-500/50 pattern-dots-weight bg-amber-950/40" aria-hidden="true"></div>
          <span><strong>Typical Weight</strong> (heuristic impact)</span>
          <span className="text-[10px] font-mono text-neutral-400 italic">AI estimate, not a measurement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 light:text-amber-800 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Attention Gap</span>
          </span>
          <span className="text-neutral-400 light:text-neutral-500">Neglected high weight</span>
        </div>
      </div>

      {/* Screen Readers Default Semantic Table: Always rendered in DOM for assistive tech, visually shown when showTable=true */}
      <div 
        id="attention-map-accessible-table" 
        className={`${showTable ? 'block' : 'sr-only'} overflow-x-auto border border-neutral-800 light:border-neutral-200 rounded-xl mb-6`}
      >
        <table className="w-full text-left text-sm text-neutral-200 light:text-neutral-800">
          <caption className="p-3 text-left font-bold text-neutral-300 light:text-neutral-700 bg-neutral-950/80 light:bg-neutral-100 border-b border-neutral-800 light:border-neutral-200 text-xs">
            Screen Reader Default Table View: Attention Map Data with Airtime (AI estimate, not a measurement), Typical Weight (AI estimate, not a measurement), and Gap Inquiries.
          </caption>
          <thead className="bg-neutral-950 light:bg-neutral-200 text-xs uppercase font-mono text-neutral-400 light:text-neutral-600">
            <tr>
              <th scope="col" className="p-3.5">Dimension & Pattern</th>
              <th scope="col" className="p-3.5">Airtime (% of words) [AI estimate, not a measurement]</th>
              <th scope="col" className="p-3.5">Typical Weight (%) [AI estimate, not a measurement]</th>
              <th scope="col" className="p-3.5">Gap Status</th>
              <th scope="col" className="p-3.5">Diagnostic Rationale & Suggested Inquiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 light:divide-neutral-200 bg-neutral-900/40 light:bg-white text-xs">
            {dimensions.map((dim) => {
              const patternClass = getDimensionPatternClass(dim.id, dim.name);
              return (
                <tr key={dim.id} className={dim.isGap ? 'bg-amber-500/5 light:bg-amber-50' : ''}>
                  <th scope="row" className="p-3.5 font-semibold text-neutral-100 light:text-neutral-900">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded border border-neutral-600 ${patternClass}`} aria-hidden="true" />
                      <span>{dim.name}</span>
                    </div>
                    <span className="block text-[11px] font-normal text-neutral-400 light:text-neutral-500 mt-0.5">{dim.description}</span>
                  </th>
                  <td className="p-3.5 font-mono font-bold text-cyan-400 light:text-cyan-700">
                    {dim.airtime}% <span className="text-[10px] text-neutral-400 font-normal block">AI estimate, not a measurement</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-400 light:text-amber-700">
                    {dim.likelyWeight}% <span className="text-[10px] text-neutral-400 font-normal block">AI estimate, not a measurement</span>
                  </td>
                  <td className="p-3.5">
                    {dim.isGap ? (
                      <span className="px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-300 light:text-amber-800 border border-amber-500/40">
                        Attention Gap
                      </span>
                    ) : (
                      <span className="text-neutral-500">Covered</span>
                    )}
                  </td>
                  <td className="p-3.5 max-w-md">
                    <p className="text-neutral-300 light:text-neutral-700">{dim.gapRationale}</p>
                    <p className="text-neutral-400 light:text-neutral-600 italic mt-1 font-medium">Inquiry: "{dim.suggestedInquiry}"</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visual Paired Bars View with Dimension Patterns & Keyboard Focus Tooltips */}
      {!showTable && (
        <div className="space-y-4" role="region" aria-label="Interactive Attention Map Graphical Bars">
          {dimensions.map((dim) => {
            const isGap = dim.isGap;
            const dimPattern = getDimensionPatternClass(dim.id, dim.name);
            const isFocused = focusedDimId === dim.id;

            return (
              <div
                key={dim.id}
                tabIndex={0}
                role="group"
                aria-label={`${dim.name}: Airtime ${dim.airtime}% (AI estimate, not a measurement), Typical Weight ${dim.likelyWeight}% (AI estimate, not a measurement). ${isGap ? 'Identified as a high-risk attention gap.' : ''}`}
                aria-describedby={`tooltip-dim-${dim.id}`}
                onFocus={() => setFocusedDimId(dim.id)}
                onBlur={() => setFocusedDimId(null)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all outline-none relative ${
                  isGap
                    ? 'bg-amber-950/20 light:bg-amber-50/70 border-amber-500/50 light:border-amber-400 hover:border-amber-400 shadow-sm'
                    : 'bg-neutral-950/50 light:bg-neutral-50 border-neutral-800/80 light:border-neutral-200 hover:border-neutral-700'
                } focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-amber-500`}
              >
                {/* Header row for dimension */}
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {/* Dimension tactile pattern swatch */}
                      <div 
                        className={`w-4 h-4 rounded-md border border-neutral-700 shadow-inner ${dimPattern}`} 
                        title={`Tactile pattern for ${dim.name}`}
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-neutral-100 light:text-neutral-900">{dim.name}</h4>
                      {isGap && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 light:text-amber-800 border border-amber-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" aria-hidden="true" />
                          <span>Attention Gap</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 light:text-neutral-500 mt-0.5">{dim.description}</p>
                  </div>

                  <div className="flex items-center gap-5 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-neutral-500 light:text-neutral-400 block text-[10px] uppercase">Airtime</span>
                      <span className="font-bold text-cyan-400 light:text-cyan-700 text-sm">{dim.airtime}%</span>
                      <span className="text-[10px] text-neutral-400 light:text-neutral-500 block font-sans">AI estimate, not a measurement</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 light:text-neutral-400 block text-[10px] uppercase">Typical Weight</span>
                      <span className="font-bold text-amber-400 light:text-amber-700 text-sm">{dim.likelyWeight}%</span>
                      <span className="text-[10px] text-neutral-400 light:text-neutral-500 block font-sans">AI estimate, not a measurement</span>
                    </div>
                  </div>
                </div>

                {/* Paired horizontal tracks with tactile pattern fill per dimension */}
                <div className="space-y-2.5 mb-3" aria-hidden="true">
                  {/* Track 1: Airtime with Dimension Unique Pattern Fill */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 light:text-neutral-500 mb-1 font-mono">
                      <span>Airtime in your write-up</span>
                      <span>{dim.airtime}% (AI estimate, not a measurement)</span>
                    </div>
                    <div className="w-full bg-neutral-900 light:bg-neutral-200 h-4 rounded-full overflow-hidden border border-neutral-800 light:border-neutral-300 flex p-0.5">
                      <div
                        className={`h-full rounded-full border-r-2 border-cyan-400 transition-all duration-700 ${dimPattern}`}
                        style={{ width: `${Math.max(3, Math.min(100, dim.airtime))}%` }}
                      />
                    </div>
                  </div>

                  {/* Track 2: Typical Weight with Stippled Pattern */}
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 light:text-neutral-500 mb-1 font-mono">
                      <span>Typical weight for this decision class</span>
                      <span>{dim.likelyWeight}% (AI estimate, not a measurement)</span>
                    </div>
                    <div className="w-full bg-neutral-900 light:bg-neutral-200 h-4 rounded-full overflow-hidden border border-neutral-800 light:border-neutral-300 flex p-0.5">
                      <div
                        className="h-full rounded-full bg-amber-500/50 pattern-dots-weight border-r-2 border-amber-400 transition-all duration-700"
                        style={{ width: `${Math.max(3, Math.min(100, dim.likelyWeight))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Always-visible summary note */}
                <div className="text-xs pt-2.5 border-t border-neutral-800/60 light:border-neutral-200 space-y-1">
                  <p className="text-neutral-300 light:text-neutral-700 leading-relaxed">
                    <span className="text-neutral-400 light:text-neutral-500 font-semibold">Why this matters: </span>
                    {dim.gapRationale}
                  </p>
                  <p className="text-amber-300 light:text-amber-800 italic flex items-start gap-1.5 pt-0.5 font-medium">
                    <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" aria-hidden="true" />
                    <span>Inquiry: "{dim.suggestedInquiry}"</span>
                  </p>
                </div>

                {/* Keyboard & Hover Tooltip: appears when row is focused or hovered */}
                <div
                  id={`tooltip-dim-${dim.id}`}
                  role="tooltip"
                  className={`absolute right-4 top-2 z-30 max-w-sm p-3.5 bg-neutral-950 light:bg-white border-2 border-amber-500/80 rounded-xl shadow-2xl text-xs space-y-2 transition-all duration-200 pointer-events-none ${
                    isFocused 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                  aria-hidden={!isFocused}
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 light:border-neutral-200 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-100 light:text-neutral-900">
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>{dim.name} Details</span>
                    </div>
                    {isGap && (
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                        High-Risk Gap
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-1.5 bg-neutral-900 light:bg-neutral-100 rounded">
                      <span className="text-neutral-400 block text-[10px]">Airtime</span>
                      <strong className="text-cyan-400 light:text-cyan-700">{dim.airtime}%</strong>
                      <span className="text-[9px] text-neutral-400 block">AI estimate, not a measurement</span>
                    </div>
                    <div className="p-1.5 bg-neutral-900 light:bg-neutral-100 rounded">
                      <span className="text-neutral-400 block text-[10px]">Weight</span>
                      <strong className="text-amber-400 light:text-amber-700">{dim.likelyWeight}%</strong>
                      <span className="text-[9px] text-neutral-400 block">AI estimate, not a measurement</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-300 light:text-neutral-700 italic">
                    "{dim.suggestedInquiry}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});

export default AttentionMapComponent;
