/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CombinedXRayAnalysis } from '../schemas/xraySchemas.js';
import { Printer, ArrowLeft, Download, Copy, Check } from 'lucide-react';

interface DecisionReflectionViewProps {
  analysis: CombinedXRayAnalysis;
  userReflections: Record<string, string>;
  testedAssumptions: Record<string, boolean>;
  onBack: () => void;
}

export const DecisionReflectionView: React.FC<DecisionReflectionViewProps> = ({
  analysis,
  userReflections,
  testedAssumptions,
  onBack
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = async () => {
    const md = [
      `# Decision Reflection Document: ${analysis.input.decisionTitle}`,
      `*Generated via BlindSpot: Decision Reasoning X-Ray on ${new Date(analysis.createdAt).toLocaleDateString()}*`,
      ``,
      `> **Notice**: This document contains open inquiries, attention gaps, and assumption stress-tests. It contains NO verdict, recommendation, score, or option ranking.`,
      ``,
      `## 1. Attention Map Gaps`,
      ...(analysis.callA?.attentionMap.filter(d => d.isGap).map(d => `- **${d.name}**: Airtime: ${d.airtime}% vs Typical weight: ${d.likelyWeight}%. Rationale: ${d.gapRationale}`) || []),
      ``,
      `## 2. Unexamined Assumptions & 72-Hour Tests`,
      ...(analysis.callB?.hiddenAssumptions.map((ha, i) => `${i + 1}. [${testedAssumptions[ha.id] ? 'TESTED' : 'UNTESTED'}] **${ha.statement}**\n   - *Why Shaky*: ${ha.vulnerability}\n   - *Cheapest Test*: ${ha.cheapestTest}`) || []),
      ``,
      `## 3. Questions To Sit With & Reflections`,
      ...(analysis.callB?.questionsToSitWith.map((q, i) => `### Q${i + 1}: ${q}\n**Your Notes**: ${userReflections[`q-${i}`] || '*(No reflection recorded)*'}\n`) || []),
      ``,
      `## 4. Four Perspective Lenses`,
      `- **Future Self (6m)**: ${analysis.callB?.perspectiveLenses.futureSelfLens.sixMonths}`,
      `- **Future Self (5y)**: ${analysis.callB?.perspectiveLenses.futureSelfLens.fiveYears}`,
      `- **Pre-Mortem Failure Point**: ${analysis.callB?.perspectiveLenses.preMortemLens.scenarioDescription}`,
      `- **Outsider Perspective**: ${analysis.callB?.perspectiveLenses.outsiderLens.probingQuestion}`,
      `- **Opposite Steelman**: ${analysis.callB?.perspectiveLenses.oppositeSteelmanLens.steelmanCase}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Action controls (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 no-print border-b border-neutral-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Audit</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <article className="print-container bg-white text-neutral-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-neutral-200 space-y-8 font-sans">
        <header className="border-b-2 border-neutral-800 pb-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-amber-700">
              BlindSpot • Decision Reasoning X-Ray
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              {new Date(analysis.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Decision Reflection Document
          </h1>
          <p className="text-sm font-semibold text-neutral-700 mt-1 italic">
            "{analysis.input.decisionTitle}"
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Non-directive reflection record • Questions and notes only • Strictly no verdict or scores
          </p>
        </header>

        {/* Section 1: Attention Gaps */}
        {analysis.callA && (
          <section className="print-card space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-800 border-b border-neutral-200 pb-1">
              1. High-Priority Attention Gaps (Low Words, High Weight)
            </h2>
            <div className="space-y-3">
              {analysis.callA.attentionMap.filter(d => d.isGap).map((dim) => (
                <div key={dim.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                  <div className="flex justify-between font-bold text-neutral-900 mb-1">
                    <span>{dim.name}</span>
                    <span className="font-mono text-amber-800 text-[11px]">
                      Airtime: {dim.airtime}% [AI estimate, not a measurement] vs Typical Weight: {dim.likelyWeight}% [AI estimate, not a measurement]
                    </span>
                  </div>
                  <p className="text-neutral-700">{dim.gapRationale}</p>
                  <p className="text-neutral-900 font-medium italic mt-1">Inquiry: "{dim.suggestedInquiry}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Hidden Assumptions */}
        {analysis.callB && (
          <section className="print-card space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-800 border-b border-neutral-200 pb-1">
              2. Unstated Assumptions & Cheapest 72-Hour Tests
            </h2>
            <div className="space-y-3">
              {analysis.callB.hiddenAssumptions.map((ha, i) => (
                <div key={ha.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>{i + 1}. {ha.statement}</span>
                    <span className="font-mono text-[10px] uppercase text-neutral-600">
                      [{testedAssumptions[ha.id] ? 'TESTED' : 'UNTESTED'}]
                    </span>
                  </div>
                  <p className="text-neutral-600"><strong className="text-neutral-800">Vulnerability:</strong> {ha.vulnerability}</p>
                  <p className="text-emerald-800 font-semibold">
                    <strong>72-Hour Test:</strong> {ha.cheapestTest}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Questions & User Reflection Notes */}
        {analysis.callB && (
          <section className="print-card space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-800 border-b border-neutral-200 pb-1">
              3. Questions To Sit With & User Reflection Notes
            </h2>
            <div className="space-y-4">
              {analysis.callB.questionsToSitWith.map((q, i) => (
                <div key={i} className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-2">
                  <p className="font-bold text-neutral-900">
                    {i + 1}. {q}
                  </p>
                  <div className="pl-3 border-l-2 border-amber-600 text-neutral-700 italic">
                    <span className="font-semibold text-neutral-900 not-italic block text-[11px] mb-0.5">Your Reflection:</span>
                    {userReflections[`q-${i}`] || '(No notes entered yet)'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Perspective Lenses */}
        {analysis.callB && (
          <section className="print-card space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-neutral-800 border-b border-neutral-200 pb-1">
              4. Perspective Lenses (Diagnostic Angles)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <strong className="block text-neutral-900 mb-1">Future Self (6m & 5y)</strong>
                <p className="text-neutral-700">{analysis.callB.perspectiveLenses.futureSelfLens.sixMonths}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <strong className="block text-neutral-900 mb-1">Pre-Mortem Failure Point</strong>
                <p className="text-neutral-700">{analysis.callB.perspectiveLenses.preMortemLens.scenarioDescription}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <strong className="block text-neutral-900 mb-1">Outsider Perspective</strong>
                <p className="text-neutral-700">"{analysis.callB.perspectiveLenses.outsiderLens.probingQuestion}"</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <strong className="block text-neutral-900 mb-1">Opposite-Steelman Case</strong>
                <p className="text-neutral-700">{analysis.callB.perspectiveLenses.oppositeSteelmanLens.steelmanCase}</p>
              </div>
            </div>
          </section>
        )}

        <footer className="pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500">
          BlindSpot • Epistemic Guarantee: Zero option recommendations, rankings, or advice provided. User maintains 100% agency.
        </footer>
      </article>
    </div>
  );
};

export default DecisionReflectionView;
