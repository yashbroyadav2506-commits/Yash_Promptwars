/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Terminal, X, AlertOctagon } from 'lucide-react';

interface ThreatModelModalProps {
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="threat-model-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 id="threat-model-title" className="text-lg font-bold text-white">
                Security & Guardrail Threat Model
              </h3>
              <p className="text-xs text-neutral-400">
                Architectural defenses, data minimization, and prompt injection mitigation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800"
            aria-label="Close threat model dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-300">
          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Lock className="w-4 h-4" />
              <span>1. Credential Isolation & Server-Only Execution</span>
            </div>
            <p className="text-neutral-400">
              The Gemini API key is anchored strictly on the backend (Secret Manager / environment). The client SPA has zero exposure to provider tokens or administrative credentials.
            </p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Terminal className="w-4 h-4" />
              <span>2. Prompt-Injection Immunity</span>
            </div>
            <p className="text-neutral-400">
              User submissions are isolated inside cryptographically distinct delimiters (<code className="text-neutral-300 font-mono">&lt;&lt;&lt;USER_DECISION_CONTEXT&gt;&gt;&gt;</code>). The system prompt instructs the model to treat all interior tokens exclusively as audited data and ignore meta-instructions or directive overrides.
            </p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <AlertOctagon className="w-4 h-4" />
              <span>3. Second-Pass Directive Language Validator</span>
            </div>
            <p className="text-neutral-400">
              All LLM output passes through an independent regex and AST scanner that detects and strips directive words ("you should", "I recommend", "best choice", "you must"). If severe directive language is detected, the pipeline automatically sanitizes or retries the call.
            </p>
          </div>

          <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-400">
              <EyeOff className="w-4 h-4" />
              <span>4. Zero Decision Text Logging</span>
            </div>
            <p className="text-neutral-400">
              Structured logs in Cloud Logging record HTTP method, status code, latency, and hashed IP. Private decision details or reflection responses are never written to disk, telemetry, or server logs.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
