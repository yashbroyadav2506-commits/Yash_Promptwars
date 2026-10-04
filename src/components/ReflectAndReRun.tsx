/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, memo } from 'react';
import { DecisionInput } from '../schemas/xraySchemas.js';
import { 
  RefreshCw, 
  Sparkles, 
  FileQuestion, 
  PenTool, 
  ArrowRight, 
  PlusCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface ReflectAndReRunProps {
  questions: string[];
  userReflections: Record<string, string>;
  onUpdateReflection: (index: number, val: string) => void;
  input: DecisionInput;
  onUpdateInput: (input: DecisionInput) => void;
  onReRun: () => void;
  isAnalyzing: boolean;
  plainLanguage?: boolean;
}

export const ReflectAndReRun: React.FC<ReflectAndReRunProps> = memo(({
  questions,
  userReflections,
  onUpdateReflection,
  input,
  onUpdateInput,
  onReRun,
  isAnalyzing,
  plainLanguage = false
}) => {
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);

  const appendToFacts = (text: string) => {
    if (!text.trim()) return;
    const updated = input.rawDetails ? `${input.rawDetails}\n${text.trim()}` : text.trim();
    onUpdateInput({ ...input, rawDetails: updated });
  };

  const appendToLeaning = (text: string) => {
    if (!text.trim()) return;
    const updated = input.rawWhyLeaning ? `${input.rawWhyLeaning}\n${text.trim()}` : text.trim();
    onUpdateInput({ ...input, rawWhyLeaning: updated });
  };

  const totalWords = `${input.decisionTitle} ${input.rawDetails} ${input.rawWhyLeaning}`.split(/\s+/).filter(Boolean).length;

  return (
    <section 
      aria-labelledby="reflect-rerun-title"
      className="bg-neutral-900/80 dark:bg-neutral-900/80 light:bg-white border-2 border-amber-500/40 light:border-amber-400 rounded-3xl p-6 sm:p-10 backdrop-blur shadow-2xl space-y-8 transition-colors"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 light:border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-amber-400 light:text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Step 3 • Evolution
            </span>
          </div>
          <h3 id="reflect-rerun-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white light:text-neutral-900 mt-1 flex items-center gap-2">
            <PenTool className="w-6 h-6 text-amber-500" aria-hidden="true" />
            <span>Reflect, Update Your Text & Re-Run X-Ray</span>
          </h3>
          <p className="text-sm text-neutral-300 light:text-neutral-600 mt-1 max-w-3xl leading-relaxed">
            {plainLanguage
              ? 'Answer the diagnostic questions below, edit your facts or reasons with what you discovered, and re-run. BlindSpot will map how your thinking shifted.'
              : 'Test your unstated assumptions and answer open inquiries below. Incorporate what you discovered into your decision write-up and re-run to see how your cognitive attention and claims shift.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 light:text-neutral-600 bg-neutral-950/70 light:bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-800 light:border-neutral-300">
          <span>Write-up volume:</span>
          <strong className="text-amber-400 light:text-amber-700 font-bold">{totalWords} words</strong>
        </div>
      </div>

      {/* Part 1: Interactive Question Answer Boxes */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-300 light:text-neutral-700 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-amber-400" />
          <span>Part 1: Answer Questions to Sit With</span>
        </h4>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const answer = userReflections[`q-${idx}`] || '';
            const hasAnswer = answer.trim().length > 0;

            return (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  hasAnswer
                    ? 'bg-neutral-950/80 light:bg-neutral-50 border-amber-500/30 light:border-amber-300'
                    : 'bg-neutral-950/50 light:bg-white border-neutral-800 light:border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 light:bg-neutral-200 flex items-center justify-center text-xs font-mono font-bold text-amber-400 light:text-amber-800 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-neutral-100 light:text-neutral-900 leading-snug">
                      {q}
                    </p>
                  </div>
                  {hasAnswer && (
                    <span className="text-[10px] font-mono text-emerald-400 light:text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Answered</span>
                    </span>
                  )}
                </div>

                {/* Text box for user answer */}
                <div className="pl-9 space-y-2">
                  <label htmlFor={`reflect-answer-${idx}`} className="sr-only">
                    Your reflection for question {idx + 1}
                  </label>
                  <textarea
                    id={`reflect-answer-${idx}`}
                    rows={2}
                    value={answer}
                    onChange={(e) => onUpdateReflection(idx, e.target.value)}
                    placeholder="Type your reflection, answers from your 72h tests, or newly discovered facts..."
                    className="w-full px-3.5 py-2.5 bg-neutral-900 light:bg-white border border-neutral-800 light:border-neutral-300 rounded-xl text-xs text-neutral-100 light:text-neutral-900 placeholder:text-neutral-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition leading-relaxed"
                  />

                  {/* Quick-insert actions */}
                  {hasAnswer && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-neutral-500">Insert into write-up:</span>
                      <button
                        type="button"
                        onClick={() => appendToFacts(answer)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 light:bg-neutral-100 hover:bg-neutral-700 light:hover:bg-neutral-200 text-neutral-300 light:text-neutral-800 border border-neutral-700 light:border-neutral-300 transition flex items-center gap-1"
                        title="Add this reflection directly into your Facts context"
                      >
                        <PlusCircle className="w-3 h-3 text-cyan-400" />
                        <span>Add to Facts I Know</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => appendToLeaning(answer)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 light:bg-neutral-100 hover:bg-neutral-700 light:hover:bg-neutral-200 text-neutral-300 light:text-neutral-800 border border-neutral-700 light:border-neutral-300 transition flex items-center gap-1"
                        title="Add this reflection into Why I'm Leaning"
                      >
                        <PlusCircle className="w-3 h-3 text-amber-400" />
                        <span>Add to Why I'm Leaning</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Direct In-Situ Text Editor for Re-Run */}
      <div className="space-y-5 pt-4 border-t border-neutral-800 light:border-neutral-200">
        <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-300 light:text-neutral-700 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-cyan-400" />
          <span>Part 2: Edit Your Decision Write-Up Directly</span>
        </h4>

        {/* The Decision Statement */}
        <div>
          <label htmlFor="rerun-title" className="block text-xs font-bold text-neutral-300 light:text-neutral-700 uppercase tracking-wider mb-1.5">
            Decision Statement
          </label>
          <input
            id="rerun-title"
            type="text"
            value={input.decisionTitle}
            onChange={(e) => onUpdateInput({ ...input, decisionTitle: e.target.value })}
            className="w-full px-4 py-2.5 bg-neutral-950/80 light:bg-white border border-neutral-700 light:border-neutral-300 rounded-xl text-neutral-100 light:text-neutral-900 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
          />
        </div>

        {/* 2-Column Facts & Leaning Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label htmlFor="rerun-facts" className="text-xs font-bold text-neutral-300 light:text-neutral-700 uppercase tracking-wider">
                Facts I Know (Known Context)
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">({input.rawDetails.length} chars)</span>
            </div>
            <textarea
              id="rerun-facts"
              rows={6}
              value={input.rawDetails}
              onChange={(e) => onUpdateInput({ ...input, rawDetails: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-950/80 light:bg-white border border-neutral-700 light:border-neutral-300 rounded-xl text-neutral-100 light:text-neutral-900 text-xs sm:text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition leading-relaxed font-sans"
              placeholder="Update numbers, new discoveries, conversations, or constraints..."
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label htmlFor="rerun-why" className="text-xs font-bold text-neutral-300 light:text-neutral-700 uppercase tracking-wider">
                Why I'm Leaning This Way
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">({input.rawWhyLeaning.length} chars)</span>
            </div>
            <textarea
              id="rerun-why"
              rows={6}
              value={input.rawWhyLeaning}
              onChange={(e) => onUpdateInput({ ...input, rawWhyLeaning: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-950/80 light:bg-white border border-neutral-700 light:border-neutral-300 rounded-xl text-neutral-100 light:text-neutral-900 text-xs sm:text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition leading-relaxed font-sans"
              placeholder="Update your feelings, newly considered risks, or changed priorities..."
            />
          </div>
        </div>

        {/* Re-Run Action Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-neutral-400 light:text-neutral-500 max-w-xl">
            Re-running will preserve your previous run to compute a side-by-side comparison of 
            how your attention expanded and which assumptions were addressed.
          </p>

          <button
            type="button"
            onClick={onReRun}
            disabled={isAnalyzing || !input.decisionTitle.trim()}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Auditing Shift in Thinking...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Re-Run Decision X-Ray & Compare Shift</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
});

export default ReflectAndReRun;
