/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { FileQuestion } from 'lucide-react';

interface QuestionsToSitWithProps {
  questions: string[];
  userReflections: Record<string, string>;
  onUpdateReflection: (index: number, val: string) => void;
  plainLanguage?: boolean;
}

export const QuestionsToSitWith: React.FC<QuestionsToSitWithProps> = memo(({
  questions,
  userReflections,
  onUpdateReflection,
  plainLanguage = false
}) => {
  return (
    <section aria-labelledby="questions-title" className="bg-neutral-900/60 dark:bg-neutral-900/60 light:bg-white border border-neutral-800 light:border-neutral-200 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl transition-colors">
      <div className="mb-6">
        <span className="text-xs uppercase font-mono font-bold text-amber-400 light:text-amber-600">
          {plainLanguage ? 'Open Questions' : 'Questions to Sit With'}
        </span>
        <h3 id="questions-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white light:text-neutral-900 mt-1 flex items-center gap-2">
          <FileQuestion className="w-6 h-6 text-amber-400" aria-hidden="true" />
          <span>Prioritized Open Inquiries</span>
        </h3>
        <p className="text-sm text-neutral-400 light:text-neutral-600 mt-1">
          No yes/no questions, no leading questions. Type your thoughts into the reflection boxes below before re-running.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="p-5 bg-neutral-950/70 light:bg-neutral-50 border border-neutral-800 light:border-neutral-200 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-neutral-800 light:bg-neutral-200 flex items-center justify-center text-xs font-mono font-bold text-amber-400 light:text-amber-700 shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm font-semibold text-neutral-100 light:text-neutral-900 leading-snug flex-1">
                {q}
              </p>
            </div>

            <div className="pl-9">
              <label htmlFor={`question-note-${idx}`} className="sr-only">
                Your reflection on question {idx + 1}
              </label>
              <textarea
                id={`question-note-${idx}`}
                rows={2}
                value={userReflections[`q-${idx}`] || ''}
                onChange={(e) => onUpdateReflection(idx, e.target.value)}
                placeholder="Jot down notes, hunches, or findings from your 72-hour tests..."
                className="w-full px-3 py-2 bg-neutral-900 light:bg-white border border-neutral-800 light:border-neutral-300 rounded-lg text-xs text-neutral-200 light:text-neutral-800 placeholder:text-neutral-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export default QuestionsToSitWith;
