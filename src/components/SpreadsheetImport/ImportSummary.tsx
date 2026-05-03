/**
 * ImportSummary — Apple/Swift visual rewrite (Tailwind v4 + shadcn + Framer
 * Motion + lucide-react).
 *
 * Layout:
 *   [stat tiles]  Three rounded-lg cards with subtle status tints (success
 *                 / danger / warning at 8% opacity). Counts:
 *                   - Valid     = foundCount
 *                   - Invalid   = notFoundCount + invalidCount
 *                   - Warnings  = duplicateCount
 *                 The valid/invalid/warning consolidation matches the
 *                 user-facing brief while preserving the full input shape.
 *   [callout]     Success or warning callout summarising next steps.
 *   [actions]     Back (ghost) / Start Over (ghost) / Add to Batch (yellow).
 */

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  Plus,
  RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface ImportSummaryProps {
  /** Summary statistics */
  summary: {
    readonly totalRows: number;
    readonly validatedRows: number;
    readonly foundCount: number;
    readonly notFoundCount: number;
    readonly duplicateCount: number;
    readonly invalidCount: number;
  };
  /** Callback when user wants to add found items to batch */
  onAddToBatch: () => void;
  /** Callback when user wants to go back */
  onBack: () => void;
  /** Callback when user wants to start over */
  onReset: () => void;
}

// =============================================================================
// STAT TILE
// =============================================================================

interface StatTileProps {
  label: string;
  value: number;
  Icon: LucideIcon;
  tone: 'success' | 'danger' | 'warning';
}

const TONE_CLASSES: Record<StatTileProps['tone'], string> = {
  success: 'bg-success/8 text-success',
  danger: 'bg-danger/8 text-danger',
  warning: 'bg-warning/8 text-warning',
};

function StatTile({ label, value, Icon, tone }: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-4 shadow-sm'
      )}
    >
      <div
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-md',
          TONE_CLASSES[tone]
        )}
      >
        <Icon className="size-4" strokeWidth={2} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-semibold tabular-nums text-ink">
          {value}
        </span>
        <span className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ImportSummary({
  summary,
  onAddToBatch,
  onBack,
  onReset,
}: ImportSummaryProps) {
  const validCount = summary.foundCount;
  const invalidCount = summary.notFoundCount + summary.invalidCount;
  const warningCount = summary.duplicateCount;

  const hasFoundItems = validCount > 0;

  return (
    <div data-swift className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[18px] font-semibold tracking-tight text-ink">
          Import summary
        </h3>
        <span className="font-mono text-[12px] tabular-nums text-ink-faint">
          {summary.validatedRows} / {summary.totalRows} rows validated
        </span>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Valid" value={validCount} Icon={CheckCircle2} tone="success" />
        <StatTile label="Invalid" value={invalidCount} Icon={AlertCircle} tone="danger" />
        <StatTile
          label="Warnings"
          value={warningCount}
          Icon={AlertTriangle}
          tone="warning"
        />
      </div>

      {/* Callout */}
      {hasFoundItems ? (
        <div
          className={cn(
            'flex items-start gap-2 rounded-md border border-success/20 bg-success/8 px-3 py-2',
            'text-[13px] leading-snug text-ink'
          )}
        >
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
          <div>
            <span className="font-semibold text-success">
              {validCount} model{validCount === 1 ? '' : 's'} ready
            </span>{' '}
            <span className="text-ink-muted">
              to add to your batch search.
              {summary.notFoundCount > 0 &&
                ` (${summary.notFoundCount} not found in the database)`}
            </span>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex items-start gap-2 rounded-md border border-warning/20 bg-warning/8 px-3 py-2',
            'text-[13px] leading-snug text-ink'
          )}
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
          <div>
            <span className="font-semibold text-warning">
              No matching models found.
            </span>{' '}
            <span className="text-ink-muted">
              Check your spreadsheet and column mapping.
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Back to mapping
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Start over
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onAddToBatch}
          disabled={!hasFoundItems}
          className="h-9 gap-1.5 bg-axis-yellow text-ink shadow-sm hover:brightness-105 active:brightness-95 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          Add to batch
          {hasFoundItems && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink/10 px-1.5 text-[11px] font-semibold tabular-nums text-ink">
              {validCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
