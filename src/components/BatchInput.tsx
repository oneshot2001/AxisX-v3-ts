/**
 * BatchInput — Apple/Swift visual rewrite (Tailwind v4 + shadcn + Framer Motion).
 *
 * Public API is unchanged — this drop-in replacement of the Fluent-UI version
 * keeps `BatchInputProps` identical so `App.tsx` doesn't need to change.
 *
 * Layout:
 *   [textarea]   large, hairline border, monospace, axis-yellow focus ring
 *   [progress]   spring-animated bar (only while isProcessing)
 *   [actions]    [model count chip] · [Search All] · [Clear]   + keyboard hint
 */

import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BatchProgress } from '@/types';

// =============================================================================
// TYPES (unchanged from Fluent version)
// =============================================================================

export interface BatchInputProps {
  /** Current raw input value */
  value: string;

  /** Callback when input changes */
  onChange: (value: string) => void;

  /** Callback when search is triggered */
  onSearch: () => void;

  /** Callback to clear input */
  onClear: () => void;

  /** Number of models parsed from input */
  modelCount: number;

  /** Whether batch search is in progress */
  isProcessing: boolean;

  /** Current progress */
  progress: BatchProgress;

  /** Placeholder text */
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER =
  'Enter camera models, one per line...\n\nExample:\nDS-2CD2143G2-I\nHNM-4221R\nIPC-HFW2831E-S';

// =============================================================================
// COMPONENT
// =============================================================================

export function BatchInput({
  value,
  onChange,
  onSearch,
  onClear,
  modelCount,
  isProcessing,
  progress,
  placeholder = DEFAULT_PLACEHOLDER,
}: BatchInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter to search
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  const canSearch = modelCount > 0 && !isProcessing;
  const canClear = value.length > 0 && !isProcessing;

  return (
    <div data-swift className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Batch Search
          </h2>
          <p className="text-[12px] text-ink-faint">
            One model per line. Cmd+Enter to search.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-muted">Models detected</span>
          <motion.span
            key={modelCount}
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 32 }}
            className={cn(
              'inline-flex h-6 min-w-7 items-center justify-center rounded-full px-2',
              'text-[12px] font-semibold tabular-nums',
              modelCount > 0
                ? 'bg-axis-yellow-soft text-axis-yellow-ink'
                : 'bg-secondary text-ink-faint'
            )}
            aria-live="polite"
          >
            {modelCount}
          </motion.span>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isProcessing}
          aria-label="Enter camera models for batch search"
          className={cn(
            'block w-full resize-y rounded-lg border border-hairline bg-surface',
            'min-h-[180px] px-3.5 py-3 font-mono text-[13px] leading-relaxed text-ink',
            'placeholder:font-mono placeholder:text-ink-faint',
            'shadow-sm transition-all duration-150 ease-out',
            'focus:outline-none focus:border-axis-yellow focus:ring-2 focus:ring-axis-yellow/40',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        />
      </div>

      {/* Progress bar */}
      <AnimatePresence initial={false}>
        {isProcessing && (
          <motion.div
            key="progress"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ overflow: 'hidden' }}
            className="flex flex-col gap-1.5"
            role="status"
            aria-live="polite"
          >
            <div
              className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-axis-yellow"
                initial={false}
                animate={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            </div>
            <div className="flex items-center justify-between text-[12px] text-ink-muted">
              <span>Processing...</span>
              <span className="font-mono tabular-nums">
                {progress.current} / {progress.total} ({progress.percent}%)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onSearch}
          disabled={!canSearch}
          size="default"
          className={cn(
            'h-9 gap-1.5 bg-axis-yellow text-ink shadow-sm',
            'hover:brightness-105 active:brightness-95'
          )}
        >
          <Search className="size-4" />
          Search All ({modelCount})
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={!canClear}
          size="default"
          className="h-9 gap-1.5"
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
