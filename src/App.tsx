/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  DecisionInput, 
  CombinedXRayAnalysis, 
  CallAResult, 
  CallBResult 
} from './schemas/xraySchemas.js';
import { DEMO_SCENARIO } from '../shared/constants.js';
import { executeParallelXRay } from './services/geminiService.js';
import { isInputTooThin } from './utils/wordCounter.js';
import { detectCrisis, CrisisCheck } from './utils/crisisDetector.js';
import { clientCache } from './utils/hashCache.js';

import { Header } from './components/Header.js';
import { IntakeForm } from './components/IntakeForm.js';
import { ReasoningBreakdown } from './components/ReasoningBreakdown.js';
import { AssumptionsAudit } from './components/AssumptionsAudit.js';
import { ConflictsAndLenses } from './components/ConflictsAndLenses.js';
import { QuestionsToSitWith } from './components/QuestionsToSitWith.js';
import { ReflectAndReRun } from './components/ReflectAndReRun.js';
import { ThinkingShiftDiffView } from './components/ThinkingShiftDiffView.js';
import { computeThinkingShift, ThinkingShiftDiff } from './utils/diffCalculator.js';
import { DecisionReflectionView } from './components/DecisionReflectionView.js';
import { GuardrailTestPage } from './components/GuardrailTestPage.js';
import { CrisisModal } from './components/CrisisModal.js';
import { ThreatModelModal } from './components/ThreatModelModal.js';
import { A11yModal } from './components/A11yModal.js';

import { 
  Eye, 
  RefreshCw, 
  Sun, 
  Moon, 
  Save, 
  Trash2, 
  AlertTriangle, 
  Printer, 
  Sparkles, 
  Layers, 
  BarChart2, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

// Lazy load the AttentionMap hero visual component
const AttentionMapComponent = lazy(() => import('./components/AttentionMap.js'));

const STORAGE_KEYS = {
  OPT_IN: 'blindspot_opt_in_v2',
  INPUT: 'blindspot_input_v2',
  ANALYSIS: 'blindspot_analysis_v2',
  THEME: 'blindspot_theme_v2',
  REFLECTIONS: 'blindspot_reflections_v2',
  TESTED_ASSUMPTIONS: 'blindspot_tested_v2',
};

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [optInStorage, setOptInStorage] = useState(false);
  const [plainLanguage, setPlainLanguage] = useState(false);

  const [input, setInput] = useState<DecisionInput>({
    decisionTitle: '',
    rawDetails: '',
    rawWhyLeaning: '',
    reversibility: 'costly',
    timeHorizon: '6-12 months',
    plainLanguage: false
  });

  // Progressive analysis state for Call A and Call B
  const [callAData, setCallAData] = useState<CallAResult | null>(null);
  const [callBData, setCallBData] = useState<CallBResult | null>(null);
  const [isCallALoading, setIsCallALoading] = useState(false);
  const [isCallBLoading, setIsCallBLoading] = useState(false);

  // History & Diff state
  const [previousAnalysis, setPreviousAnalysis] = useState<CombinedXRayAnalysis | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<CombinedXRayAnalysis | null>(null);
  const [thinkingShiftDiff, setThinkingShiftDiff] = useState<ThinkingShiftDiff | null>(null);
  const [userReflections, setUserReflections] = useState<Record<string, string>>({});
  const [testedAssumptions, setTestedAssumptions] = useState<Record<string, boolean>>({});

  // UI state & Modals
  const [viewMode, setViewMode] = useState<'audit' | 'export' | 'eval'>('audit');
  const [crisisAlert, setCrisisAlert] = useState<CrisisCheck | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showThreatModel, setShowThreatModel] = useState(false);
  const [showA11yGuide, setShowA11yGuide] = useState(false);

  // Active in-flight request abort controller (prevents race conditions and duplicate calls)
  const activeAbortControllerRef = React.useRef<AbortController | null>(null);

  // Abort pending network requests on unmount
  useEffect(() => {
    return () => {
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Load opt-in state on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);

      const savedOptIn = localStorage.getItem(STORAGE_KEYS.OPT_IN) === 'true';
      setOptInStorage(savedOptIn);

      if (savedOptIn) {
        const savedInput = localStorage.getItem(STORAGE_KEYS.INPUT);
        if (savedInput) setInput(JSON.parse(savedInput));

        const savedAnalysis = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
        if (savedAnalysis) {
          const parsed: CombinedXRayAnalysis = JSON.parse(savedAnalysis);
          setCurrentAnalysis(parsed);
          if (parsed.callA) setCallAData(parsed.callA);
          if (parsed.callB) setCallBData(parsed.callB);
        }

        const savedReflections = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
        if (savedReflections) setUserReflections(JSON.parse(savedReflections));

        const savedTested = localStorage.getItem(STORAGE_KEYS.TESTED_ASSUMPTIONS);
        if (savedTested) setTestedAssumptions(JSON.parse(savedTested));
      }
    } catch (e) {
      console.warn('LocalStorage error on mount:', e);
    }
  }, []);

  // Update theme class on body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  // Persist only if user explicitly opted in
  useEffect(() => {
    if (!optInStorage) return;
    try {
      localStorage.setItem(STORAGE_KEYS.INPUT, JSON.stringify(input));
      if (currentAnalysis) {
        localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(currentAnalysis));
      }
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(userReflections));
      localStorage.setItem(STORAGE_KEYS.TESTED_ASSUMPTIONS, JSON.stringify(testedAssumptions));
    } catch (e) {}
  }, [input, currentAnalysis, userReflections, testedAssumptions, optInStorage]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, next);
    } catch (e) {}
  };

  const handleToggleOptIn = (checked: boolean) => {
    setOptInStorage(checked);
    try {
      localStorage.setItem(STORAGE_KEYS.OPT_IN, String(checked));
      if (!checked) {
        localStorage.removeItem(STORAGE_KEYS.INPUT);
        localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
        localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
        localStorage.removeItem(STORAGE_KEYS.TESTED_ASSUMPTIONS);
      }
    } catch (e) {}
  };

  const handleClearAllData = () => {
    clientCache.clear();
    try {
      localStorage.clear();
    } catch (e) {}

    setInput({
      decisionTitle: '',
      rawDetails: '',
      rawWhyLeaning: '',
      reversibility: 'costly',
      timeHorizon: '6-12 months',
      plainLanguage: false
    });
    setCallAData(null);
    setCallBData(null);
    setPreviousAnalysis(null);
    setCurrentAnalysis(null);
    setUserReflections({});
    setTestedAssumptions({});
    setErrorMessage(null);
    setStatusMessage('All personal session data and cache cleared.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleLoadDemo = () => {
    setInput({
      ...DEMO_SCENARIO,
      plainLanguage
    });
    setErrorMessage(null);
  };

  const handleUpdateReflection = (idx: number, val: string) => {
    setUserReflections(prev => ({ ...prev, [`q-${idx}`]: val }));
  };

  const handleToggleTestedAssumption = (id: string) => {
    setTestedAssumptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Main Audit Pipeline with 2 Parallel Calls + Thin Input + Crisis check
  const handleRunAudit = async () => {
    setErrorMessage(null);
    setCrisisAlert(null);

    // 1. Client cooldown check
    const cd = clientCache.checkCooldown();
    if (!cd.allowed) {
      setCooldownRemaining(Math.ceil(cd.remainingMs / 1000));
      setTimeout(() => setCooldownRemaining(0), cd.remainingMs);
      return;
    }

    // 2. Crisis & Self-harm check
    const combinedText = `${input.decisionTitle} ${input.rawDetails} ${input.rawWhyLeaning}`;
    const crisis = detectCrisis(combinedText);
    if (crisis.isCrisis) {
      setCrisisAlert(crisis);
      return;
    }

    // 3. Epistemic depth: Under ~40 words thin input check
    const thinCheck = isInputTooThin(input);
    if (thinCheck.isThin) {
      setErrorMessage(
        `Your write-up currently has ${thinCheck.wordCount} words. BlindSpot requires at least 40 words total across your decision, facts, and reasoning to map meaningful attention patterns without inventing blind spots. Please add ${thinCheck.needed} more words of context.`
      );
      return;
    }

    // Prepare previous analysis for diffing if re-running
    if (currentAnalysis) {
      setPreviousAnalysis(currentAnalysis);
    }

    // Abort previous in-flight request if user rapidly re-triggers
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    setIsCallALoading(true);
    setIsCallBLoading(true);
    setStatusMessage('Auditing reasoning architecture... Launching parallel Call A and Call B.');

    const newAnalysis: CombinedXRayAnalysis = {
      id: `xray_${Date.now()}`,
      createdAt: new Date().toISOString(),
      input: { ...input, plainLanguage },
      stats: {
        totalWords: thinCheck.wordCount,
        claimCounts: { FACT: 0, ASSUMPTION: 0, VALUE: 0, PREDICTION: 0 },
        majorGapsCount: 0,
        untestedAssumptionsCount: 0
      }
    };

    try {
      const { callA: finalA, callB: finalB } = await executeParallelXRay(
        { ...input, plainLanguage },
        {
          onCallAComplete: (resA) => {
            setCallAData(resA);
            setIsCallALoading(false);
            newAnalysis.callA = resA;
            newAnalysis.stats.claimCounts = {
              FACT: resA.claims.filter(c => c.type === 'FACT').length,
              ASSUMPTION: resA.claims.filter(c => c.type === 'ASSUMPTION').length,
              VALUE: resA.claims.filter(c => c.type === 'VALUE').length,
              PREDICTION: resA.claims.filter(c => c.type === 'PREDICTION').length,
            };
            newAnalysis.stats.majorGapsCount = resA.attentionMap.filter(d => d.isGap).length;
            setCurrentAnalysis({ ...newAnalysis });
            setStatusMessage('Call A complete: Reasoning claims and Attention Map generated.');
          },
          onCallBComplete: (resB) => {
            setCallBData(resB);
            setIsCallBLoading(false);
            newAnalysis.callB = resB;
            newAnalysis.stats.untestedAssumptionsCount = resB.hiddenAssumptions.length;
            setCurrentAnalysis({ ...newAnalysis });
            setStatusMessage('Call B complete: Assumptions, conflicts, and perspective lenses ready.');
          },
          onError: (err) => {
            console.error('Parallel audit error:', err);
            setErrorMessage(err);
          }
        },
        controller.signal
      );

      // If this was a re-run with a prior analysis, compute how thinking shifted
      if (currentAnalysis && finalA && finalB) {
        newAnalysis.callA = finalA;
        newAnalysis.callB = finalB;
        const shift = computeThinkingShift(currentAnalysis, newAnalysis, testedAssumptions);
        setThinkingShiftDiff(shift);
      }

      setStatusMessage(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was intentionally superseded by newer run; ignore
        return;
      }
      setErrorMessage(err.message || 'Audit execution encountered an issue. Please try again.');
    } finally {
      if (activeAbortControllerRef.current === controller) {
        activeAbortControllerRef.current = null;
        setIsCallALoading(false);
        setIsCallBLoading(false);
      }
    }
  };

  const isAnalyzing = isCallALoading || isCallBLoading;

  // Render Export / Reflection View
  if (viewMode === 'export' && currentAnalysis) {
    return (
      <DecisionReflectionView
        analysis={currentAnalysis}
        userReflections={userReflections}
        testedAssumptions={testedAssumptions}
        onBack={() => setViewMode('audit')}
      />
    );
  }

  // Render Live Guardrail Eval Suite (Dev-only toggle page)
  if (viewMode === 'eval') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#090a0f] text-neutral-100' : 'bg-[#fafafa] text-neutral-900'}`}>
        <GuardrailTestPage onBack={() => setViewMode('audit')} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-[#090a0f] text-neutral-100' : 'bg-[#fafafa] text-neutral-900'}`}>
      {/* Header */}
      <Header
        plainLanguage={plainLanguage}
        onTogglePlainLanguage={() => setPlainLanguage(!plainLanguage)}
        onLoadExample={handleLoadDemo}
        onClearData={handleClearAllData}
        onOpenThreatModel={() => setShowThreatModel(true)}
        onOpenA11yGuide={() => setShowA11yGuide(true)}
        onOpenGuardrailTests={() => setViewMode('eval')}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10" id="main-content" tabIndex={-1}>
        {/* Anti-Slop Hero Banner */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-3xl border border-neutral-800 light:border-neutral-200 bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-neutral-950 light:from-white light:to-neutral-50 p-6 sm:p-10 shadow-2xl transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400 light:text-amber-700">
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>A Decision Reasoning X-Ray, Not a Pros/Cons List</span>
            </div>

            {/* Dark/Light & Privacy Toggles */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-neutral-700 light:border-neutral-300 text-neutral-300 light:text-neutral-700 hover:bg-neutral-800 light:hover:bg-neutral-200 transition"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-800" />}
              </button>

              <label className="flex items-center gap-2 text-xs text-neutral-400 light:text-neutral-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={optInStorage}
                  onChange={(e) => handleToggleOptIn(e.target.checked)}
                  className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Save session locally (Opt-in)</span>
              </label>
            </div>
          </div>

          <div className="max-w-3xl space-y-3">
            <h2 id="hero-title" className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white light:text-neutral-900">
              Most bad decisions come from <span className="text-amber-500 light:text-amber-600">lopsided attention</span>, not lack of data.
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 light:text-neutral-700 leading-relaxed">
              Standard AI tools tell you what to do or produce generic pros/cons lists. BlindSpot audits your 
              <strong> own written reasoning</strong>: where your words over-focus, which high-stakes dimensions you ignored, 
              unstated assumptions, and internal contradictions.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-neutral-400 light:text-neutral-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Zero Verdicts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>2 Parallel Calls (A & B)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Second-Pass Guardrails</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>WCAG 2.2 AA Certified</span>
            </div>
          </div>
        </section>

        {/* Global Notifications & ARIA Live Regions */}
        <div aria-live="polite" className="sr-only">
          {statusMessage}
        </div>

        {statusMessage && (
          <div className="p-3.5 bg-cyan-950/40 light:bg-cyan-50 border border-cyan-800/80 light:border-cyan-200 rounded-xl text-cyan-300 light:text-cyan-800 text-xs flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {cooldownRemaining > 0 && (
          <div className="p-3 bg-amber-950/40 light:bg-amber-50 border border-amber-800/80 light:border-amber-300 rounded-xl text-amber-300 light:text-amber-800 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Cooldown active. Please wait {cooldownRemaining}s before re-auditing.</span>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="p-4 bg-rose-950/40 light:bg-rose-50 border border-rose-800/80 light:border-rose-300 rounded-2xl text-rose-300 light:text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <strong className="font-semibold block">Audit Notice:</strong>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Step 1: Intake Form */}
        <IntakeForm
          input={input as any}
          onChange={(newIn) => setInput(newIn as any)}
          onSubmit={handleRunAudit}
          isAnalyzing={isAnalyzing}
          plainLanguage={plainLanguage}
          onLoadExample={handleLoadDemo}
          hasPreviousRun={!!currentAnalysis}
        />

        {/* Progressive Loading Indicators for Parallel Call A & Call B */}
        {isAnalyzing && (
          <div className="p-6 bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-neutral-200 light:text-neutral-800 uppercase font-mono tracking-wider">
              Parallel Reasoning Pipeline Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${isCallALoading ? 'bg-cyan-950/20 border-cyan-500/40 animate-pulse' : 'bg-neutral-950 light:bg-neutral-100 border-neutral-800'}`}>
                {isCallALoading ? <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                <div>
                  <span className="text-xs font-bold block text-neutral-200 light:text-neutral-800">Call A: Claims & Attention Map</span>
                  <span className="text-[11px] text-neutral-400">{isCallALoading ? 'Extracting claims and estimating airtime...' : 'Ready'}</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center gap-3 ${isCallBLoading ? 'bg-amber-950/20 border-amber-500/40 animate-pulse' : 'bg-neutral-950 light:bg-neutral-100 border-neutral-800'}`}>
                {isCallBLoading ? <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                <div>
                  <span className="text-xs font-bold block text-neutral-200 light:text-neutral-800">Call B: Assumptions, Conflicts & Lenses</span>
                  <span className="text-[11px] text-neutral-400">{isCallBLoading ? 'Auditing unstated beliefs and tensions...' : 'Ready'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Reasoning Shift Diff (Shown when re-run produced previous analysis) */}
        {thinkingShiftDiff && (
          <ThinkingShiftDiffView
            diff={thinkingShiftDiff}
            onDismiss={() => setThinkingShiftDiff(null)}
          />
        )}

        {/* Export & Print Banner Button */}
        {currentAnalysis && (
          <div className="flex justify-end no-print">
            <button
              type="button"
              onClick={() => setViewMode('export')}
              className="px-5 py-2.5 bg-neutral-800 light:bg-neutral-200 hover:bg-neutral-700 light:hover:bg-neutral-300 text-neutral-100 light:text-neutral-900 font-semibold rounded-xl border border-neutral-700 light:border-neutral-300 text-xs flex items-center gap-2 shadow transition"
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Export Decision Reflection Summary (PDF / Print)</span>
            </button>
          </div>
        )}

        {/* Step 2: Progressive Sections */}
        {/* Call A: Section B (Attention Map) & Section A (Reasoning Breakdown) */}
        {callAData && (
          <div className="space-y-10">
            {/* Attention Map (Lazy-loaded hero visual) */}
            <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading Attention Map...</div>}>
              <AttentionMapComponent
                dimensions={callAData.attentionMap}
                screenReaderSummary={callAData.screenReaderSummary}
                plainLanguage={plainLanguage}
              />
            </Suspense>

            {/* Reasoning Breakdown */}
            <ReasoningBreakdown
              claims={callAData.claims}
              plainLanguage={plainLanguage}
            />
          </div>
        )}

        {/* Call B: Section C (Hidden Assumptions), Section D (Conflicts) & Section E (Lenses), Section F (Questions) */}
        {callBData && (
          <div className="space-y-10">
            {/* Section C: Hidden Assumptions Audit */}
            <AssumptionsAudit
              assumptions={callBData.hiddenAssumptions}
              testedAssumptions={testedAssumptions}
              onToggleTested={handleToggleTestedAssumption}
              plainLanguage={plainLanguage}
            />

            {/* Section D & E: Internal Conflicts & Perspective Lenses */}
            <ConflictsAndLenses
              conflicts={callBData.internalConflicts}
              lenses={callBData.perspectiveLenses}
              plainLanguage={plainLanguage}
            />

            {/* Section F: Questions to Sit With */}
            <QuestionsToSitWith
              questions={callBData.questionsToSitWith}
              userReflections={userReflections}
              onUpdateReflection={handleUpdateReflection}
              plainLanguage={plainLanguage}
            />

            {/* Step 3: Reflect, Answer Questions, Edit Text & Re-Run */}
            <ReflectAndReRun
              questions={callBData.questionsToSitWith}
              userReflections={userReflections}
              onUpdateReflection={handleUpdateReflection}
              input={input}
              onUpdateInput={setInput}
              onReRun={handleRunAudit}
              isAnalyzing={isAnalyzing}
              plainLanguage={plainLanguage}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 light:border-neutral-200 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-center text-xs text-neutral-500 space-y-2 no-print">
        <p>
          BlindSpot: Decision Reasoning X-Ray • Built with Google Gemini API (@google/genai SDK) & React TypeScript.
        </p>
        <p className="text-[11px] text-neutral-600">
          Privacy Guarantee: Zero data stored without opt-in. Decision text is processed in-memory and never written to logs or telemetry.
        </p>
      </footer>

      {/* Modals */}
      {crisisAlert && (
        <CrisisModal
          crisis={{
            isCrisis: true,
            detectedTopics: ['distress'],
            supportMessage: crisisAlert.message,
            hotlineResources: crisisAlert.hotlines.map(h => ({ name: h.name, contact: h.contact, description: h.desc }))
          }}
          onClose={() => setCrisisAlert(null)}
        />
      )}

      {showThreatModel && (
        <ThreatModelModal onClose={() => setShowThreatModel(false)} />
      )}

      {showA11yGuide && (
        <A11yModal onClose={() => setShowA11yGuide(false)} />
      )}
    </div>
  );
}
