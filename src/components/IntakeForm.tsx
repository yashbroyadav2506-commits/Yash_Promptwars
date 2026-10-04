/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, ArrowRight, RefreshCw, AlertCircle, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { DecisionInput, ReversibilityLevel, TimeHorizon } from '../../shared/types.js';

interface IntakeFormProps {
  input: DecisionInput;
  onChange: (input: DecisionInput) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  plainLanguage: boolean;
  onLoadExample: () => void;
  hasPreviousRun: boolean;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({
  input,
  onChange,
  onSubmit,
  isAnalyzing,
  plainLanguage,
  onLoadExample,
  hasPreviousRun
}) => {
  const [activeSpeechField, setActiveSpeechField] = useState<'details' | 'why' | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const startVoiceInput = (field: 'details' | 'why') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setActiveSpeechField(field);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (field === 'details') {
          onChange({
            ...input,
            rawDetails: input.rawDetails ? `${input.rawDetails} ${transcript}` : transcript
          });
        } else {
          onChange({
            ...input,
            rawWhyLeaning: input.rawWhyLeaning ? `${input.rawWhyLeaning} ${transcript}` : transcript
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setSpeechError(`Voice input issue: ${event.error}. You can still type directly.`);
        setActiveSpeechField(null);
      };

      recognition.onend = () => {
        setActiveSpeechField(null);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech initiation error:', e);
      setActiveSpeechField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.decisionTitle.trim()) return;
    onSubmit();
  };

  return (
    <section aria-labelledby="intake-heading" className="bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-mono font-semibold text-amber-400 light:text-amber-700">
            {plainLanguage ? 'Step 1: Your Write-Up' : 'Phase 1: Reasoning Intake'}
          </span>
          <h2 id="intake-heading" className="text-xl sm:text-2xl font-bold text-white light:text-neutral-900 tracking-tight mt-1">
            {hasPreviousRun ? 'Refine & Re-Run Reasoning Audit' : 'Lay Out Your Thinking'}
          </h2>
          <p className="text-sm text-neutral-300 light:text-neutral-700 mt-1 max-w-2xl leading-relaxed">
            {plainLanguage
              ? 'Tell us what you are deciding and why. We do not judge your choices; we only show where your focus is going.'
              : 'BlindSpot analyzes your text as cognitive data. Write freely—the audit will map attention, identify unstated assumptions, and detect internal conflicts.'}
          </p>
        </div>

        {!input.decisionTitle && (
          <button
            type="button"
            onClick={onLoadExample}
            className="text-xs text-amber-300 light:text-amber-800 bg-amber-500/10 light:bg-amber-50 border border-amber-500/30 light:border-amber-300 hover:bg-amber-500/20 px-3.5 py-2 rounded-xl flex items-center gap-2 transition font-medium"
          >
            <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Load sample student decision</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Field 1: The Decision */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <label htmlFor="decision-title" className="block text-sm font-semibold text-neutral-100 light:text-neutral-900">
              The Decision <span className="text-amber-400 light:text-amber-600">*</span>
            </label>
            <span className="text-xs text-neutral-400 light:text-neutral-600 font-mono">One clear sentence</span>
          </div>
          <input
            id="decision-title"
            type="text"
            required
            value={input.decisionTitle}
            onChange={(e) => onChange({ ...input, decisionTitle: e.target.value })}
            placeholder="e.g. Should I accept a 6-month startup internship and postpone graduation by one semester?"
            className="w-full px-4 py-3 bg-neutral-950/80 light:bg-white border border-neutral-700/80 light:border-neutral-300 rounded-xl text-neutral-100 light:text-neutral-900 placeholder:text-neutral-500 light:placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition"
          />
        </div>

        {/* 2-Column Inputs for Facts vs Leaning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field 2: Known Facts & Context */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="raw-details" className="text-sm font-semibold text-neutral-100 light:text-neutral-900 flex items-center gap-1.5">
                <span>{plainLanguage ? 'The Facts (What you know)' : 'Known Context & Facts'}</span>
                <span className="text-neutral-400 light:text-neutral-600 text-xs font-normal">({input.rawDetails.length} chars)</span>
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => startVoiceInput('details')}
                  className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition ${
                    activeSpeechField === 'details'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-neutral-800 light:bg-neutral-100 border-neutral-700 light:border-neutral-300 text-neutral-300 light:text-neutral-700 hover:bg-neutral-700'
                  }`}
                  aria-label="Dictate context via microphone"
                >
                  {activeSpeechField === 'details' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{activeSpeechField === 'details' ? 'Listening...' : 'Voice input'}</span>
                </button>
              )}
            </div>
            <textarea
              id="raw-details"
              rows={5}
              value={input.rawDetails}
              onChange={(e) => onChange({ ...input, rawDetails: e.target.value })}
              placeholder="e.g. Stipend is $3,500/mo, 20-min bus commute, 40 hrs/wk in person. 2 founders, 4 engineers, no senior designer. Requires postponing two seminar courses."
              className="w-full px-4 py-3 bg-neutral-950/80 light:bg-white border border-neutral-700/80 light:border-neutral-300 rounded-xl text-neutral-100 light:text-neutral-900 placeholder:text-neutral-500 light:placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition leading-relaxed"
            />
            <p className="text-xs text-neutral-400 light:text-neutral-600">
              {plainLanguage
                ? 'Include numbers, constraints, locations, people, and deadlines.'
                : 'Measurable facts, organizational structure, explicit financial terms, and temporal deadlines.'}
            </p>
          </div>

          {/* Field 3: Why leaning this way */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="raw-why" className="text-sm font-semibold text-neutral-100 light:text-neutral-900 flex items-center gap-1.5">
                <span>{plainLanguage ? "Why you're leaning this way" : "Why I'm Leaning This Way"}</span>
                <span className="text-neutral-400 light:text-neutral-600 text-xs font-normal">({input.rawWhyLeaning.length} chars)</span>
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => startVoiceInput('why')}
                  className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition ${
                    activeSpeechField === 'why'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-neutral-800 light:bg-neutral-100 border-neutral-700 light:border-neutral-300 text-neutral-300 light:text-neutral-700 hover:bg-neutral-700'
                  }`}
                  aria-label="Dictate reasoning via microphone"
                >
                  {activeSpeechField === 'why' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{activeSpeechField === 'why' ? 'Listening...' : 'Voice input'}</span>
                </button>
              )}
            </div>
            <textarea
              id="raw-why"
              rows={5}
              value={input.rawWhyLeaning}
              onChange={(e) => onChange({ ...input, rawWhyLeaning: e.target.value })}
              placeholder="e.g. The pay is solid and helps pay off debt. It's close to home. Most of all, it gives me 'real startup experience' on my resume which everyone says is valuable."
              className="w-full px-4 py-3 bg-neutral-950/80 light:bg-white border border-neutral-700/80 light:border-neutral-300 rounded-xl text-neutral-100 light:text-neutral-900 placeholder:text-neutral-500 light:placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition leading-relaxed"
            />
            <p className="text-xs text-neutral-400 light:text-neutral-600">
              {plainLanguage
                ? 'What reasons would you give a close friend over coffee?'
                : 'Raw, honest justification: emotional instincts, peer impressions, fears, and hopes.'}
            </p>
          </div>
        </div>

        {speechError && (
          <div role="alert" className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Optional Framing: Reversibility & Time Horizon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-neutral-800/80 light:border-neutral-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-200 light:text-neutral-800 mb-2">
              Decision Reversibility (Optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { level: 'easy', label: 'Easy (Type 2)', tip: 'Can easily backtrack with minimal penalty' },
                  { level: 'costly', label: 'Costly', tip: 'Takes months or money to reverse' },
                  { level: 'near-permanent', label: 'Near-Permanent (Type 1)', tip: 'One-way door decision' }
                ] as const
              ).map(({ level, label, tip }) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => onChange({ ...input, reversibility: level })}
                  title={tip}
                  className={`p-2.5 text-xs rounded-xl border text-center font-medium transition ${
                    input.reversibility === level
                      ? 'bg-amber-500/20 light:bg-amber-100 border-amber-500 text-amber-300 light:text-amber-900 ring-1 ring-amber-500'
                      : 'bg-neutral-950/60 light:bg-neutral-100 border-neutral-800 light:border-neutral-300 text-neutral-300 light:text-neutral-700 hover:text-neutral-100 hover:border-neutral-700'
                  }`}
                  aria-pressed={input.reversibility === level}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-200 light:text-neutral-800 mb-2">
              Primary Time Horizon (Optional)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  '1-3 months',
                  '6-12 months',
                  '2-5 years',
                  '10+ years'
                ] as TimeHorizon[]
              ).map((horizon) => (
                <button
                  type="button"
                  key={horizon}
                  onClick={() => onChange({ ...input, timeHorizon: horizon })}
                  className={`p-2.5 text-xs rounded-xl border text-center font-medium transition ${
                    input.timeHorizon === horizon
                      ? 'bg-amber-500/20 light:bg-amber-100 border-amber-500 text-amber-300 light:text-amber-900 ring-1 ring-amber-500'
                      : 'bg-neutral-950/60 light:bg-neutral-100 border-neutral-800 light:border-neutral-300 text-neutral-300 light:text-neutral-700 hover:text-neutral-100 hover:border-neutral-700'
                  }`}
                  aria-pressed={input.timeHorizon === horizon}
                >
                  {horizon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Info className="w-4 h-4 text-neutral-500 shrink-0" aria-hidden="true" />
            <span>Strict prompt-injection protection active. Content is audited, never stored without consent.</span>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !input.decisionTitle.trim()}
            className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Auditing Reasoning Architecture...</span>
              </>
            ) : hasPreviousRun ? (
              <>
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Re-Run X-Ray & Diff Thinking</span>
              </>
            ) : (
              <>
                <span>Run Decision X-Ray</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
