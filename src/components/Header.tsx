/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Sparkles, BookOpen, Trash2, Eye, HelpCircle } from 'lucide-react';

interface HeaderProps {
  plainLanguage: boolean;
  onTogglePlainLanguage: () => void;
  onLoadExample: () => void;
  onClearData: () => void;
  onOpenThreatModel: () => void;
  onOpenA11yGuide: () => void;
  onOpenGuardrailTests?: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  plainLanguage,
  onTogglePlainLanguage,
  onLoadExample,
  onClearData,
  onOpenThreatModel,
  onOpenA11yGuide,
  onOpenGuardrailTests,
  isAnalyzing
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30">
      {/* Skip link for screen reader and keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-amber-500 text-neutral-950 px-4 py-2 font-semibold rounded-md shadow-lg outline-none"
      >
        Skip to main decision analysis
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/10 font-bold text-xl tracking-tight border border-amber-400/30">
            BS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                BlindSpot
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium tracking-normal border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  REASONING X-RAY
                </span>
              </h1>
            </div>
            <p className="text-xs text-neutral-400">
              Audits your thinking architecture • Never recommends, ranks, or scores options
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onTogglePlainLanguage}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              plainLanguage
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
            aria-pressed={plainLanguage}
            title="Toggle simplified, plain-language cognitive terminology"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{plainLanguage ? 'Plain Language: ON' : 'Plain Language'}</span>
          </button>

          <button
            type="button"
            onClick={onLoadExample}
            disabled={isAnalyzing}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Load the 6-month student internship dilemma scenario"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Try Internship Example</span>
          </button>

          {onOpenGuardrailTests && (
            <button
              type="button"
              onClick={onOpenGuardrailTests}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-purple-500/40 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Dev Mode: Run 19 live eval scenarios against Gemini API"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
              <span>Guardrail Eval Suite (Dev)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenThreatModel}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
            title="View Security Threat Model & Guardrails"
            aria-label="Security threat model and AI guardrails"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onOpenA11yGuide}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
            title="View WCAG 2.2 AA Accessibility features"
            aria-label="Accessibility checklist and features"
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onClearData}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors flex items-center gap-1"
            title="Clear all inputs and reset session data immediately"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Epistemic Guardrail banner */}
      <div className="bg-neutral-900/60 border-t border-neutral-800/80 px-4 py-1.5 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" aria-hidden="true"></span>
        <span className="font-medium text-neutral-300">Epistemic Guarantee:</span>
        <span>BlindSpot tests unstated assumptions and attention gaps. It has zero authority to tell you what to choose.</span>
      </div>
    </header>
  );
};
