/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { XRayAnalysis } from '../../shared/types.js';
import { Printer, Copy, Check, Download, X, FileText, AlertCircle } from 'lucide-react';

interface ExportSummaryModalProps {
  analysis: XRayAnalysis;
  userReflections: Record<string, string>;
  testedAssumptions: Record<string, boolean>;
  onClose: () => void;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  analysis,
  userReflections,
  testedAssumptions,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const generateMarkdown = (): string => {
    const lines: string[] = [
      `# Decision Reflection Summary: ${analysis.decisionTitle}`,
      `*Generated with BlindSpot Reasoning X-Ray on ${new Date(analysis.createdAt).toLocaleDateString()}*`,
      ``,
      `> **Epistemic Notice**: This reflection document contains diagnostic inquiries, attention gaps, and assumption stress-tests. It contains NO recommendation, advice, or ranking.`,
      ``,
      `## 1. Attention Map Gaps (Under-attended Dimensions)`,
      ...analysis.attentionMap
        .filter(d => d.isGap)
        .map(d => `- **${d.name}**: Airtime in write-up: ${d.airtime}% vs Likely weight: ${d.likelyWeight}%. Rationale: ${d.gapRationale}`),
      ``,
      `## 2. Hidden Assumptions & 72-Hour Tests`,
      ...analysis.hiddenAssumptions.map((h, i) => {
        const isTested = !!testedAssumptions[h.id];
        return `${i + 1}. [${isTested ? 'TESTED' : 'OPEN'}] **Assumption**: ${h.statement}\n   - *Vulnerability*: ${h.vulnerability}\n   - *Cheapest Test*: ${h.cheapestTest}`;
      }),
      ``,
      `## 3. Core Questions to Sit With`,
      ...analysis.questionsToSitWith.map((q, i) => {
        const userNote = userReflections[`q-${i}`] || '*(No reflection noted yet)*';
        return `### Q${i + 1}: ${q}\n**Your Reflection**: ${userNote}\n`;
      }),
      ``,
      `## 4. Four Perspective Lenses`,
      `- **Future Self (6 months)**: ${analysis.perspectiveLenses.futureSelfLens.sixMonths}`,
      `- **Future Self (5 years)**: ${analysis.perspectiveLenses.futureSelfLens.fiveYears}`,
      `- **Pre-Mortem Failure Point**: ${analysis.perspectiveLenses.preMortemLens.scenarioDescription}`,
      `- **Outsider Perspective (${analysis.perspectiveLenses.outsiderLens.affectedStakeholder})**: ${analysis.perspectiveLenses.outsiderLens.probingQuestion}`,
      `- **Opposite Steelman Case**: ${analysis.perspectiveLenses.oppositeSteelmanLens.steelmanCase}`
    ];

    return lines.join('\n');
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `blindspot-reflection-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header (Hidden on print) */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 id="export-modal-title" className="text-lg font-bold text-white">
              One-Page Decision Reflection Summary
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar (Hidden on print) */}
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-800/80 flex flex-wrap gap-2.5 justify-end no-print">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Reflection Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print-container text-neutral-200 font-sans">
          <div className="border-b border-neutral-700 pb-4">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block mb-1">
              BlindSpot Reasoning Audit
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {analysis.decisionTitle}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Document generated {new Date(analysis.createdAt).toLocaleDateString()} • Strictly non-directive reflection record
            </p>
          </div>

          {/* Attention Gaps */}
          <div>
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-mono mb-2">
              1. High-Priority Attention Gaps
            </h4>
            <div className="space-y-2">
              {analysis.attentionMap
                .filter(d => d.isGap)
                .map((dim) => (
                  <div key={dim.id} className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-lg text-xs">
                    <div className="flex justify-between font-semibold text-neutral-200">
                      <span>{dim.name}</span>
                      <span className="font-mono text-amber-400">Airtime: {dim.airtime}% | Weight: {dim.likelyWeight}%</span>
                    </div>
                    <p className="text-neutral-400 mt-1">{dim.gapRationale}</p>
                    <p className="text-neutral-300 italic mt-1 font-medium">Inquiry: "{dim.suggestedInquiry}"</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Hidden Assumptions */}
          <div>
            <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wider font-mono mb-2">
              2. Assumptions & Cheapest 72-Hour Tests
            </h4>
            <div className="space-y-2">
              {analysis.hiddenAssumptions.map((ha, i) => (
                <div key={ha.id} className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-neutral-200">
                    <span>{i + 1}. {ha.statement}</span>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      [{testedAssumptions[ha.id] ? 'TESTED' : 'UNTESTED'}]
                    </span>
                  </div>
                  <p className="text-neutral-400"><strong className="text-neutral-300">Why shaky:</strong> {ha.vulnerability}</p>
                  <p className="text-emerald-300 font-medium">
                    <strong>72-Hour Test:</strong> {ha.cheapestTest}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions & Reflections */}
          <div>
            <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono mb-2">
              3. Questions To Sit With & User Notes
            </h4>
            <div className="space-y-3">
              {analysis.questionsToSitWith.map((q, i) => (
                <div key={i} className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-lg text-xs space-y-1.5">
                  <p className="font-semibold text-neutral-100">
                    {i + 1}. {q}
                  </p>
                  <div className="pl-4 border-l-2 border-amber-500/40 text-neutral-300 italic">
                    {userReflections[`q-${i}`] || '(No notes entered yet)'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer statement */}
          <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-500 text-center">
            BlindSpot Decision Reasoning X-Ray • No verdict, recommendation, or advice provided • User maintains 100% agency.
          </div>
        </div>
      </div>
    </div>
  );
};
