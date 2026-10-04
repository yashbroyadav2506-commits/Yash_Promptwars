/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, memo } from 'react';
import { EVAL_SCENARIOS, EvalScenario } from '../data/evalScenarios.js';
import { 
  ShieldCheck, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  RefreshCw, 
  Terminal, 
  Eye, 
  X,
  FileCode,
  Flame,
  HelpCircle
} from 'lucide-react';

export interface ScenarioRunResult {
  scenarioId: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  outcome?: 'success' | 'crisis' | 'thin_input';
  latencyMs?: number;
  checks?: {
    noDirectiveLanguage: { passed: boolean; violations: string[] };
    schemaValid: { passed: boolean; errors: string[] };
    crisisFallback: { passed: boolean; message?: string };
    thinFallback: { passed: boolean; message?: string };
    injectionImmunity: { passed: boolean; violation?: string };
  };
  rawCallA?: any;
  rawCallB?: any;
  error?: string;
}

interface GuardrailTestPageProps {
  onBack: () => void;
}

export const GuardrailTestPage: React.FC<GuardrailTestPageProps> = memo(({ onBack }) => {
  const [results, setResults] = useState<Record<string, ScenarioRunResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'passed' | 'failed' | 'adversarial'>('all');
  const [inspectScenario, setInspectScenario] = useState<{ scenario: EvalScenario; result?: ScenarioRunResult } | null>(null);

  const stopSignalRef = useRef(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectScenario) {
        setInspectScenario(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectScenario]);

  const runSingleScenario = async (scenario: EvalScenario): Promise<ScenarioRunResult> => {
    setResults(prev => ({
      ...prev,
      [scenario.id]: { scenarioId: scenario.id, status: 'running' }
    }));

    try {
      const res = await fetch('/api/eval/run-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const runResult: ScenarioRunResult = {
        scenarioId: scenario.id,
        status: data.passed ? 'passed' : 'failed',
        outcome: data.outcome,
        latencyMs: data.latencyMs,
        checks: data.checks,
        rawCallA: data.rawCallA,
        rawCallB: data.rawCallB,
        error: data.error
      };

      setResults(prev => ({ ...prev, [scenario.id]: runResult }));
      return runResult;
    } catch (err: any) {
      const failResult: ScenarioRunResult = {
        scenarioId: scenario.id,
        status: 'failed',
        error: err.message || 'Execution error'
      };
      setResults(prev => ({ ...prev, [scenario.id]: failResult }));
      return failResult;
    }
  };

  const runAllScenarios = async () => {
    setIsRunningAll(true);
    stopSignalRef.current = false;

    for (const scenario of EVAL_SCENARIOS) {
      if (stopSignalRef.current) break;
      await runSingleScenario(scenario);
      // Small pause between live requests to prevent rate spikes
      await new Promise(r => setTimeout(r, 200));
    }

    setIsRunningAll(false);
  };

  const stopRun = () => {
    stopSignalRef.current = true;
    setIsRunningAll(false);
  };

  // Stats
  const total = EVAL_SCENARIOS.length;
  const passedCount = Object.values(results).filter(r => r.status === 'passed').length;
  const failedCount = Object.values(results).filter(r => r.status === 'failed').length;
  const runningCount = Object.values(results).filter(r => r.status === 'running').length;
  const completedCount = passedCount + failedCount;

  // Filtered list
  const filteredScenarios = EVAL_SCENARIOS.filter(s => {
    if (activeFilter === 'adversarial') return s.category.toLowerCase().includes('adversarial');
    const res = results[s.id];
    if (activeFilter === 'passed') return res?.status === 'passed';
    if (activeFilter === 'failed') return res?.status === 'failed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Bar with Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to BlindSpot App</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            Dev Mode • Live Gemini Guardrail Eval Suite
          </span>
        </div>
      </div>

      {/* Header & Dashboard Stats */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
              <span>Guardrail Verification Suite (19 Scenarios)</span>
            </h1>
            <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
              Executes live decision reasoning audits across 15 diverse domains and 4 adversarial attacks 
              (advice-demands, prompt injection override, thin gibberish, and crisis language) against the real Gemini API.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isRunningAll ? (
              <button
                type="button"
                onClick={stopRun}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
              >
                <Pause className="w-4 h-4" />
                <span>Stop Testing</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={runAllScenarios}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold rounded-xl text-xs flex items-center gap-2 transition shadow-xl shadow-amber-500/20"
              >
                <Play className="w-4 h-4 fill-neutral-950" />
                <span>Run All 19 Live Tests</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Total Scenarios</span>
            <span className="text-2xl font-extrabold text-neutral-100 font-mono">{total}</span>
          </div>

          <div className="p-4 bg-neutral-950/70 border border-emerald-500/30 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Passing</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{passedCount}</span>
          </div>

          <div className="p-4 bg-neutral-950/70 border border-rose-500/30 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">Failing</span>
            <span className="text-2xl font-extrabold text-rose-400 font-mono">{failedCount}</span>
          </div>

          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold block">Progress</span>
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">
              {Math.round((completedCount / total) * 100)}%
            </span>
          </div>
        </div>

        {/* Progress track */}
        {isRunningAll && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Running Live Gemini API Evaluation...</span>
              <span>{completedCount} / {total} Completed</span>
            </div>
            <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${(completedCount / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {(
            [
              { id: 'all', label: `All Scenarios (${total})` },
              { id: 'adversarial', label: 'Adversarial Attacks (4)' },
              { id: 'passed', label: `Passed (${passedCount})` },
              { id: 'failed', label: `Failed (${failedCount})` },
            ] as const
          ).map(({ id, label }) => (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={activeFilter === id}
              onClick={() => setActiveFilter(id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
                activeFilter === id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario List */}
      <div className="space-y-4">
        {filteredScenarios.map((scenario) => {
          const res = results[scenario.id];
          const isRunning = res?.status === 'running';
          const isPassed = res?.status === 'passed';
          const isFailed = res?.status === 'failed';

          return (
            <div
              key={scenario.id}
              className={`p-5 rounded-2xl border transition-all ${
                isPassed
                  ? 'bg-neutral-900/60 border-emerald-500/30'
                  : isFailed
                  ? 'bg-neutral-900/60 border-rose-500/40'
                  : isRunning
                  ? 'bg-neutral-900/90 border-amber-500/40 animate-pulse'
                  : 'bg-neutral-900/40 border-neutral-800'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {scenario.category}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-100">
                      {scenario.name}
                    </h3>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
                    {scenario.description}
                  </p>

                  {/* 5 Guardrail Check Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {/* Check 1: No Directive Language */}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                      res?.checks?.noDirectiveLanguage.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : res?.checks?.noDirectiveLanguage.passed === false
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                    }`}>
                      {res?.checks?.noDirectiveLanguage.passed ? <CheckCircle2 className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      <span>No Directive Language</span>
                    </span>

                    {/* Check 2: Schema Valid */}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                      res?.checks?.schemaValid.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : res?.checks?.schemaValid.passed === false
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                    }`}>
                      {res?.checks?.schemaValid.passed ? <CheckCircle2 className="w-3 h-3" /> : <FileCode className="w-3 h-3" />}
                      <span>Schema Valid</span>
                    </span>

                    {/* Check 3: Crisis Fallback */}
                    {scenario.expectedOutcome === 'crisis' && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        res?.checks?.crisisFallback.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Crisis Fallback (Hotlines)</span>
                      </span>
                    )}

                    {/* Check 4: Thin Fallback */}
                    {scenario.expectedOutcome === 'thin_input' && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        res?.checks?.thinFallback.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Thin Input Notice</span>
                      </span>
                    )}

                    {/* Check 5: Injection Immunity */}
                    {scenario.category.toLowerCase().includes('adversarial') && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        res?.checks?.injectionImmunity.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : res?.checks?.injectionImmunity.passed === false
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Injection Immunity</span>
                      </span>
                    )}

                    {res?.latencyMs && (
                      <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>{res.latencyMs}ms</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {res && (
                    <button
                      type="button"
                      onClick={() => setInspectScenario({ scenario, result: res })}
                      className="px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => runSingleScenario(scenario)}
                    disabled={isRunning}
                    className="px-3.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-neutral-300" />
                        <span>Run Live</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Modal Drawer */}
      {inspectScenario && (
        <div 
          role="dialog" 
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block">
                  Inspection Payload
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {inspectScenario.scenario.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectScenario(null)}
                className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scenario Input */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase">Input Text Sent:</span>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300 space-y-1">
                <p><strong>Decision:</strong> {inspectScenario.scenario.input.decisionTitle}</p>
                <p><strong>Facts:</strong> {inspectScenario.scenario.input.rawDetails}</p>
                <p><strong>Why Leaning:</strong> {inspectScenario.scenario.input.rawWhyLeaning}</p>
              </div>
            </div>

            {/* Raw JSON Responses */}
            {inspectScenario.result?.rawCallA && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Call A Output (Claims & Attention Map):</span>
                <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectScenario.result.rawCallA, null, 2)}
                </pre>
              </div>
            )}

            {inspectScenario.result?.rawCallB && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">Call B Output (Assumptions & Lenses):</span>
                <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48">
                  {JSON.stringify(inspectScenario.result.rawCallB, null, 2)}
                </pre>
              </div>
            )}

            {inspectScenario.result?.error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300">
                <strong>Error:</strong> {inspectScenario.result.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default GuardrailTestPage;
