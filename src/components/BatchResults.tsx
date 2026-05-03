/**
 * BatchResults — Apple/Swift visual rewrite (Tailwind v4 + shadcn + Framer Motion).
 *
 * Public API is unchanged — this drop-in replacement of the Fluent-UI version
 * keeps `BatchResultsProps` identical so `App.tsx` doesn't need to change.
 *
 * Layout:
 *   [action bar]    found N of M  ·  [select all / deselect all]
 *                                         [Add N selected to BOM] (yellow)
 *   [rows]          one Card-style row per BatchSearchItem:
 *                     [☐]  competitor input  →  [img] AXIS replacement   [qty -/+]
 *                     spec line · mount pairing chip · location
 *   [footer]        selected stats + sticky add-to-bom CTA
 */

import { useRef, useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  AlertTriangle,
  XCircle,
  Search,
  Plus,
  Minus,
  Loader2,
  CircleDashed,
} from 'lucide-react';
import type {
  BatchSearchItem,
  SearchResult,
  CompetitorMapping,
  MountPairingResult,
} from '@/types';
import { lookupSpec } from '@/core/specs';
import { getCameraImage, CAMERA_PLACEHOLDER_SVG } from '@/lib/cameraImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES (unchanged from Fluent version)
// =============================================================================

export interface BatchResultsProps {
  /** Batch items to display */
  items: readonly BatchSearchItem[];

  /** Callback when selection is toggled */
  onToggleSelection: (id: string) => void;

  /** Callback to select all items */
  onSelectAll: () => void;

  /** Callback to deselect all items */
  onDeselectAll: () => void;

  /** Callback when quantity changes */
  onQuantityChange: (id: string, quantity: number) => void;

  /** Callback to add selected items to cart */
  onAddSelectedToCart: () => void;

  /** Number of selected items */
  selectedCount: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function getReplacementModel(result: SearchResult): string {
  if ('axis_replacement' in result.mapping) {
    return (result.mapping as CompetitorMapping).axis_replacement;
  }
  return result.mapping.replacement_model;
}

function getBestResult(item: BatchSearchItem): SearchResult | undefined {
  if (!item.response || item.response.results.length === 0) {
    return undefined;
  }
  return item.response.results[0];
}

function getSpecLine(axisModel: string): string | null {
  try {
    const spec = lookupSpec(axisModel);
    if (!spec) return null;
    const parts: string[] = [];
    if (spec.maxResolution) parts.push(spec.maxResolution);
    if (spec.maxFps) parts.push(`${spec.maxFps}fps`);
    if (spec.codecs.length > 0) parts.push(spec.codecs.join('/'));
    if (spec.poeTypeClass || spec.powerType) {
      parts.push(spec.poeTypeClass || spec.powerType || '');
    }
    return parts.length > 0 ? parts.join(' • ') : null;
  } catch {
    return null;
  }
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ item }: { item: BatchSearchItem }) {
  const base =
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap';

  switch (item.status) {
    case 'pending':
      return (
        <span className={cn(base, 'bg-secondary text-ink-faint')}>
          <CircleDashed className="size-3" />
          Pending
        </span>
      );
    case 'searching':
      return (
        <span className={cn(base, 'bg-axis-yellow-soft text-axis-yellow-ink')}>
          <Loader2 className="size-3 animate-spin" />
          Searching
        </span>
      );
    case 'complete': {
      if (!item.response || item.response.results.length === 0) {
        return (
          <span className={cn(base, 'bg-secondary text-ink-muted')}>
            <Search className="size-3" />
            Not found
          </span>
        );
      }
      const score = item.response.results[0]?.score ?? 0;
      if (score >= 85) {
        return (
          <span className={cn(base, 'bg-success/10 text-success')}>
            <Check className="size-3" strokeWidth={2.5} />
            Match
          </span>
        );
      }
      return (
        <span className={cn(base, 'bg-warning/15 text-warning')}>
          <AlertTriangle className="size-3" />
          Partial
        </span>
      );
    }
    case 'error':
      return (
        <span className={cn(base, 'bg-danger/10 text-danger')}>
          <XCircle className="size-3" />
          Error
        </span>
      );
  }
}

// =============================================================================
// MOUNT PAIRING CHIP
// =============================================================================

function MountConfidenceChip({ pairing }: { pairing: MountPairingResult }) {
  const base =
    'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide';

  switch (pairing.mountConfidence) {
    case 'exact':
      return (
        <span className={cn(base, 'bg-success/10 text-success')}>Exact</span>
      );
    case 'series-fallback':
      return (
        <span className={cn(base, 'bg-axis-yellow-soft text-axis-yellow-ink')}>
          Series
        </span>
      );
    case 'form-factor-default':
      return (
        <span className={cn(base, 'bg-axis-yellow-soft text-axis-yellow-ink')}>
          Suggested
        </span>
      );
    case 'none':
      return (
        <span className={cn(base, 'bg-secondary text-ink-faint')}>None</span>
      );
  }
}

// =============================================================================
// CAMERA THUMBNAIL
// =============================================================================

function CameraThumb({ axisModel }: { axisModel: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn(
        'relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-2',
        'shadow-[inset_0_0_0_1px_oklch(0_0_0/0.04),inset_0_2px_4px_oklch(0_0_0/0.03)]'
      )}
    >
      {failed ? (
        <img
          src={CAMERA_PLACEHOLDER_SVG}
          alt=""
          className="size-7 opacity-60"
          aria-hidden="true"
        />
      ) : (
        <img
          src={getCameraImage(axisModel)}
          alt={`AXIS ${axisModel}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-contain p-1"
        />
      )}
    </div>
  );
}

// =============================================================================
// QUANTITY STEPPER
// =============================================================================

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}

function QuantityStepper({ value, onChange, disabled }: QuantityStepperProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState<string>(String(value));

  // Keep local draft in sync when prop changes (parent-driven updates).
  if (!disabled && inputRef.current && document.activeElement !== inputRef.current && draft !== String(value)) {
    setDraft(String(value));
  }

  const commit = (raw: string) => {
    const next = parseInt(raw, 10);
    if (!isNaN(next) && next > 0) {
      onChange(next);
      setDraft(String(next));
    } else {
      setDraft(String(value));
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border border-hairline bg-surface',
        'shadow-sm overflow-hidden',
        disabled && 'opacity-50 pointer-events-none'
      )}
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center text-ink-muted',
          'transition-colors hover:bg-secondary hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent'
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        aria-label="Quantity value"
        className={cn(
          'h-7 w-10 border-x border-hairline bg-transparent text-center font-mono text-[12px] tabular-nums text-ink',
          'focus:outline-none focus:bg-axis-yellow-soft/40'
        )}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled}
        aria-label="Increase quantity"
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center text-ink-muted',
          'transition-colors hover:bg-secondary hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent'
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

// =============================================================================
// SELECTION CHECKBOX
// =============================================================================

interface SelectCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}

function SelectCheckbox({ checked, disabled, onChange, label }: SelectCheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all',
        'shadow-sm',
        checked
          ? 'bg-axis-yellow border-axis-yellow text-ink'
          : 'bg-surface border-hairline text-transparent hover:border-ink-faint',
        disabled && 'cursor-not-allowed opacity-40'
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
      />
      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
    </label>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BatchResults({
  items,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onQuantityChange,
  onAddSelectedToCart,
  selectedCount,
}: BatchResultsProps) {
  if (items.length === 0) return null;

  const completedItems = items.filter((item) => item.status === 'complete');
  const foundItems = completedItems.filter(
    (item) => item.response && item.response.results.length > 0
  );

  const totalSelectedQty = items
    .filter((item) => item.selected && item.status === 'complete')
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div data-swift className="flex flex-col gap-3">
      {/* Action bar */}
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-4 py-2.5'
        )}
      >
        <div className="flex items-center gap-3 text-[13px]">
          <span className="font-semibold text-ink">Results</span>
          <span className="text-ink-muted">
            <span className="font-mono tabular-nums text-ink">
              {foundItems.length}
            </span>{' '}
            of{' '}
            <span className="font-mono tabular-nums text-ink">
              {completedItems.length}
            </span>{' '}
            found
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-7 px-2 text-[12px]"
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="h-7 px-2 text-[12px]"
          >
            Deselect all
          </Button>
          <Button
            type="button"
            onClick={onAddSelectedToCart}
            disabled={selectedCount === 0}
            size="sm"
            className={cn(
              'h-8 gap-1.5 bg-axis-yellow text-ink shadow-sm',
              'hover:brightness-105 active:brightness-95'
            )}
          >
            <Plus className="size-3.5" />
            Add {selectedCount > 0 ? `${selectedCount} ` : ''}selected to BOM
          </Button>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const bestResult = getBestResult(item);
            const canSelect =
              item.status === 'complete' &&
              !!item.response &&
              item.response.results.length > 0;
            const replacement = bestResult ? getReplacementModel(bestResult) : null;
            const specLine = replacement ? getSpecLine(replacement) : null;
            const notes =
              bestResult && 'notes' in bestResult.mapping
                ? bestResult.mapping.notes
                : undefined;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                whileHover={{ y: -1 }}
                className={cn(
                  'group relative rounded-lg border bg-surface px-4 py-3 shadow-sm',
                  'transition-all duration-150 ease-out',
                  'hover:border-[oklch(0.86_0_0)] hover:shadow-md',
                  item.selected && canSelect
                    ? 'border-axis-yellow/60 ring-1 ring-axis-yellow/30'
                    : 'border-hairline',
                  item.status === 'error' && 'border-danger/30 bg-danger/4'
                )}
              >
                {/* Top row */}
                <div className="flex items-center gap-3">
                  <SelectCheckbox
                    checked={item.selected}
                    disabled={!canSelect}
                    onChange={() => onToggleSelection(item.id)}
                    label={`Select ${item.input}`}
                  />

                  {/* Input model */}
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                      Input
                    </span>
                    <span className="truncate font-mono text-[14px] font-semibold text-ink">
                      {item.input}
                    </span>
                  </div>

                  {/* Arrow */}
                  {bestResult && (
                    <ArrowRight
                      className="size-4 shrink-0 text-ink-faint"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}

                  {/* Replacement */}
                  {bestResult && replacement && (
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <CameraThumb axisModel={replacement} />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-axis-yellow-ink">
                          Axis
                        </span>
                        <span className="truncate font-mono text-[14px] font-semibold text-ink">
                          {replacement}
                        </span>
                        {specLine && (
                          <span className="truncate text-[11px] text-ink-muted">
                            {specLine}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Empty/searching/error filler keeps the right side stable */}
                  {!bestResult && <div className="flex-1" />}

                  {/* Right cluster: status + quantity */}
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <StatusBadge item={item} />
                    {canSelect && (
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => onQuantityChange(item.id, q)}
                      />
                    )}
                  </div>
                </div>

                {/* Mount pairing / location / notes — secondary row */}
                {item.status === 'complete' && bestResult && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-8 text-[12px] text-ink-muted">
                    {item.mountPairing && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                          Mount
                        </span>
                        {item.mountPairing.mount ? (
                          <span className="font-medium text-ink">
                            {item.mountPairing.mount.displayName}
                          </span>
                        ) : (
                          <span className="italic text-ink-faint">
                            no {item.mountType ?? ''} mount found
                          </span>
                        )}
                        <MountConfidenceChip pairing={item.mountPairing} />
                      </span>
                    )}
                    {item.location && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                          Location
                        </span>
                        <span>{item.location}</span>
                      </span>
                    )}
                    {notes && (
                      <span className="line-clamp-1 italic text-ink-faint">
                        {notes}
                      </span>
                    )}
                  </div>
                )}

                {/* No-result message */}
                {item.status === 'complete' && !bestResult && (
                  <p className="mt-2 pl-8 text-[12px] italic text-ink-faint">
                    No matching Axis model found.
                  </p>
                )}

                {/* Error message */}
                {item.status === 'error' && item.error && (
                  <p className="mt-2 pl-8 text-[12px] text-danger">
                    {item.error}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-4 py-2.5 text-[13px]'
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-muted">
          <span>
            Selected:{' '}
            <span className="font-mono font-semibold tabular-nums text-ink">
              {selectedCount}
            </span>
          </span>
          <span>
            Total qty:{' '}
            <span className="font-mono font-semibold tabular-nums text-ink">
              {totalSelectedQty}
            </span>
          </span>
        </div>
        <Button
          type="button"
          onClick={onAddSelectedToCart}
          disabled={selectedCount === 0}
          size="sm"
          className={cn(
            'h-8 gap-1.5 bg-axis-yellow text-ink shadow-sm',
            'hover:brightness-105 active:brightness-95'
          )}
        >
          <Plus className="size-3.5" />
          Add {selectedCount > 0 ? `${selectedCount} ` : ''}selected to BOM
        </Button>
      </div>
    </div>
  );
}
