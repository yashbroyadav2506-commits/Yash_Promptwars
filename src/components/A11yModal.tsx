/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, Check, Eye, Keyboard, Volume2, ShieldCheck, X } from 'lucide-react';

interface A11yModalProps {
  onClose: () => void;
}

export const A11yModal: React.FC<A11yModalProps> = ({ onClose }) => {
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
      aria-labelledby="a11y-guide-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="a11y-guide-title" className="text-lg font-bold text-white">
                WCAG 2.2 AA Accessibility Standards
              </h3>
              <p className="text-xs text-neutral-400">
                Built for sensory, motor, and cognitive inclusion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800"
            aria-label="Close accessibility guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-neutral-300">
          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block">Non-Color-Only Attention Map (1.4.1)</strong>
              <span>
                Attention and weight metrics do not rely on color alone. Each bar features tactile background textures (diagonal stripes for Airtime, dotted stippling for Heuristic Weight), numeric percentages, and a full accessible HTML table with screen reader captions.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block">Keyboard Operability & Skip Links (2.1.1, 2.4.1)</strong>
              <span>
                Full tab navigation with high-visibility 2px focus rings (<code className="text-amber-400">focus-visible: outline-amber-500</code>). Includes an instant keyboard skip link straight to the audited reasoning layers.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block">High Contrast & 200% Text Zoom (1.4.3, 1.4.4)</strong>
              <span>
                All body text maintains a contrast ratio exceeding 7:1 against the deep neutral canvas. Fluid layouts adapt cleanly to 200% browser text scaling without overlapping.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block">Plain-Language Cognitive Mode (3.1.5)</strong>
              <span>
                An on-demand toggle translates abstract cognitive audit jargon ("Epistemic Tagging", "Attention Asymmetry") into straightforward, conversational English.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block">Voice Input via Web Speech API (2.5.3)</strong>
              <span>
                Enables hands-free or low-dexterity dictation directly into decision context fields.
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block">Reduced Motion Support (2.3.3)</strong>
              <span>
                Honors <code className="text-cyan-300 font-mono">prefers-reduced-motion: reduce</code>, disabling heavy CSS transitions and spinning keyframes.
              </span>
            </div>
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
