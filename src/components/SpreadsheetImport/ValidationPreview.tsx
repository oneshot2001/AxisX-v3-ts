/**
 * ValidationPreview — Apple/Swift visual rewrite (Tailwind v4 + shadcn +
 * Framer Motion + lucide-react).
 *
 * Layout:
 *   [progress]  Animated axis-yellow fill bar driven by Framer Motion width
 *               while validation is in flight.
 *   [filters]   Status pills with counts (All / Found / Not Found / Duplicate
 *               / Invalid). LayoutGroup gives an Apple-style sliding pill.
 *   [list]      Row list with leading status icon, row number, input model,
 *               replacement model, and quantity badge.
 */

import { useMemo, useState } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Copy,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import type {
  SpreadsheetValidationResult,
  SpreadsheetValidationStatus,
} from '@/types';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationPreviewProps {
  /** Validation results to display */
  results: readonly SpreadsheetValidationResult[];
  /** Whether validation is in progress */
  isProcessing: boolean;
  /** Current progress */
  progress: { current: number; total: number; percent: number };
}

type FilterType = 'all' | SpreadsheetValidationStatus;

interface FilterDef {
  id: FilterType;
  label: string;
  icon: typeof CheckCircle2 | null;
  iconClass?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function statusVisual(status: SpreadsheetValidationStatus) {
  switch (status) {
    case 'found':
      return { Icon: CheckCircle2, className: 'text-success' };
    case 'not-found':
      return { Icon: XCircle, className: 'text-ink-faint' };
    case 'duplicate':
      return { Icon: Copy, className: 'text-cloud' };
    case 'invalid':
      return { Icon: AlertTriangle, className: 'text-danger' };
  }
}

function getReplacementModel(result: SpreadsheetValidationResult): string | null {
  if (result.status !== 'found' || !result.searchResponse?.results.length) {
    return null;
  }
  const firstResult = result.searchResponse.results[0];
  if (!firstResult) return null;

  const mapping = firstResult.mapping;
  if ('axis_replacement' in mapping) {
    return mapping.axis_replacement;
  }
  return mapping.replacement_model;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ValidationPreview({
  results,
  isProcessing,
  progress,
}: ValidationPreviewProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const counts = useMemo(() => {
    const initial: Record<FilterType, number> = {
      all: results.length,
      found: 0,
      'not-found': 0,
      duplicate: 0,
      invalid: 0,
    };
    for (const r of results) {
      initial[r.status]++;
    }
    return initial;
  }, [results]);

  const filteredResults = useMemo(() => {
    if (filter === 'all') return results;
    return results.filter((r) => r.status === filter);
  }, [results, filter]);

  const filters: readonly FilterDef[] = [
    { id: 'all', label: 'All', icon: null },
    { id: 'found', label: 'Found', icon: CheckCircle2, iconClass: 'text-success' },
    { id: 'not-found', label: 'Not Found', icon: XCircle, iconClass: 'text-ink-faint' },
    { id: 'duplicate', label: 'Duplicate', icon: Copy, iconClass: 'text-cloud' },
    { id: 'invalid', label: 'Invalid', icon: AlertTriangle, iconClass: 'text-danger' },
  ];

  return (
    <div data-swift className="flex flex-col gap-4">
      {/* Progress bar */}
      {isProcessing && (
        <section
          className={cn(
            'flex flex-col gap-2 rounded-lg border border-hairline bg-surface-2 px-4 py-3'
          )}
          aria-live="polite"
        >
          <div className="flex items-baseline justify-between text-[12px] text-ink-muted">
            <span>Validating models…</span>
            <span className="font-mono tabular-nums">
              {progress.current} / {progress.total} ({progress.percent}%)
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            className="h-1.5 w-full overflow-hidden rounded-full bg-hairline/60"
          >
            <motion.div
              className="h-full rounded-full bg-axis-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          </div>
        </section>
      )}

      {/* Filter pills */}
      {!isProcessing && results.length > 0 && (
        <LayoutGroup id="validation-filter">
          <div
            role="tablist"
            aria-label="Filter by status"
            className="flex flex-wrap gap-1 rounded-full border border-hairline bg-surface-2 p-1"
          >
            {filters.map((f) => {
              const isActive = filter === f.id;
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'relative inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
                    isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="validation-filter-active"
                      className="absolute inset-0 -z-10 rounded-full bg-surface shadow-sm"
                      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                    />
                  )}
                  {Icon && <Icon className={cn('size-3.5', f.iconClass)} />}
                  <span>{f.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0 text-[11px] font-semibold tabular-nums',
                      isActive ? 'bg-axis-yellow-soft text-axis-yellow-ink' : 'bg-secondary text-ink-muted'
                    )}
                  >
                    {counts[f.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      )}

      {/* Results list */}
      {!isProcessing && filteredResults.length > 0 && (
        <ul
          className={cn(
            'flex max-h-[400px] flex-col gap-1.5 overflow-y-auto rounded-lg border border-hairline bg-surface p-2 shadow-sm'
          )}
        >
          <AnimatePresence initial={false}>
            {filteredResults.map((result, idx) => {
              const replacement = getReplacementModel(result);
              const { Icon, className } = statusVisual(result.status);
              return (
                <motion.li
                  key={`${result.row}-${result.input}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  className={cn(
                    'flex items-center gap-3 rounded-md bg-surface-2 px-3 py-2'
                  )}
                >
                  <Icon className={cn('size-4 shrink-0', className)} />
                  <span className="font-mono text-[11px] tabular-nums text-ink-faint w-10">
                    #{result.row}
                  </span>
                  <span className="flex-1 truncate font-mono text-[13px] font-semibold text-ink">
                    {result.input}
                  </span>
                  {replacement && (
                    <span className="hidden items-center gap-1 text-[12px] text-axis-yellow-ink sm:inline-flex">
                      <ArrowRight className="size-3" />
                      <span className="font-mono">{replacement}</span>
                    </span>
                  )}
                  <span
                    className={cn(
                      'inline-flex h-5 min-w-7 items-center justify-center rounded-full px-1.5',
                      'bg-secondary text-[11px] font-semibold tabular-nums text-ink-muted'
                    )}
                  >
                    × {result.quantity}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Empty state for active filter */}
      {!isProcessing && filteredResults.length === 0 && filter !== 'all' && (
        <div
          className={cn(
            'rounded-lg border border-dashed border-hairline bg-surface-2 px-4 py-8 text-center',
            'text-[13px] text-ink-muted'
          )}
        >
          No items match the selected filter.
        </div>
      )}
    </div>
  );
}
