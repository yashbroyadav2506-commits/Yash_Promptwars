/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CrisisDetectionResult } from '../../shared/types.js';
import { HeartHandshake, Phone, ExternalLink, X } from 'lucide-react';

interface CrisisModalProps {
  crisis: CrisisDetectionResult;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ crisis, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="crisis-dialog-title"
      aria-describedby="crisis-dialog-desc"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 id="crisis-dialog-title" className="text-xl font-bold text-white tracking-tight">
              Support & Care Resources
            </h3>
            <p className="text-xs text-neutral-400">
              Immediate confidential assistance is available right now.
            </p>
          </div>
        </div>

        <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl text-neutral-200 text-sm leading-relaxed">
          {crisis.supportMessage}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
            Free, Confidential 24/7 Lifelines:
          </h4>
          <div className="space-y-2">
            {crisis.hotlineResources.map((res, i) => (
              <div key={i} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-100">{res.name}</span>
                  <span className="text-xs font-mono font-semibold text-amber-400">{res.contact}</span>
                </div>
                <p className="text-[11px] text-neutral-400">{res.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition"
          >
            Close & Return
          </button>
        </div>
      </div>
    </div>
  );
};
