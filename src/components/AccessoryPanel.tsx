/**
 * AccessoryPanel — Apple/Swift visual rewrite (Tailwind v4 + shadcn + Framer Motion).
 *
 * Layout:
 *   [header]    "Accessories for AXIS <model>"  (semibold, ink)
 *   [filter]    pill-row of compact tabs (All / Mounts / Power / ...)
 *   [list]      Card with hairline border. Each accessory is a row:
 *                 left:   tiny lucide icon (mount/power/cable/etc.)
 *                 center: model + display name + recommendation/compat badge
 *                 right:  MSRP + "Add to BOM" outline button (or "In BOM")
 *   Framer Motion `layout` animates list re-orderings when filter tabs change.
 *
 * Backwards-compatible with the original Fluent-UI version's props.
 */

import { memo, useState, useMemo, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import {
  Plus,
  Check,
  AlertTriangle,
  Star,
  Cable,
  Plug,
  HardDrive,
  Network,
  Wrench,
  Box,
  Mountain,
} from 'lucide-react';
import type { AccessoryCompatEntry, AccessoryType } from '@/types';
import { getFormattedPrice } from '@/core/msrp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// =============================================================================
// CONSTANTS / HELPERS
// =============================================================================

const FILTER_TABS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'mount', label: 'Mounts' },
  { value: 'power', label: 'Power' },
  { value: 'cables-connectors', label: 'Cables' },
  { value: 'housings-cabinets', label: 'Housings' },
  { value: 'edge-storage', label: 'Storage' },
  { value: 'switches', label: 'Switches' },
  { value: 'tools-extras', label: 'Tools' },
];

/** Map an accessoryType onto a small lucide icon for the row leader. */
function iconFor(type: AccessoryType) {
  switch (type) {
    case 'mount':
      return Mountain;
    case 'power':
      return Plug;
    case 'cables-connectors':
      return Cable;
    case 'housings-cabinets':
      return Box;
    case 'edge-storage':
      return HardDrive;
    case 'switches':
      return Network;
    case 'tools-extras':
      return Wrench;
    default:
      return Box;
  }
}

function getMsrpDisplay(msrpKey?: string): string {
  if (!msrpKey) return 'TBD';
  try {
    return getFormattedPrice(msrpKey);
  } catch {
    return 'TBD';
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface AccessoryPanelProps {
  /** Camera model for display */
  readonly cameraModel: string;
  /** Compatible accessories to display */
  readonly accessories: readonly AccessoryCompatEntry[];
  /** Callback when "Add to BOM" is clicked */
  readonly onAddToCart: (accessory: AccessoryCompatEntry) => void;
  /** Set of accessory model keys already in cart */
  readonly cartAccessoryModels?: ReadonlySet<string>;
}

// =============================================================================
// COMPONENT
// =============================================================================

function AccessoryPanelComponent({
  cameraModel,
  accessories,
  onAddToCart,
  cartAccessoryModels,
}: AccessoryPanelProps) {
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const filteredAccessories = useMemo(() => {
    if (selectedTab === 'all') return accessories;
    return accessories.filter(
      (acc) => acc.accessoryType === (selectedTab as AccessoryType)
    );
  }, [accessories, selectedTab]);

  // Only show tabs that have accessories
  const availableTabs = useMemo(() => {
    const typesPresent = new Set(accessories.map((a) => a.accessoryType));
    return FILTER_TABS.filter(
      (tab) =>
        tab.value === 'all' || typesPresent.has(tab.value as AccessoryType)
    );
  }, [accessories]);

  const handleSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  return (
    <div data-swift data-testid="accessory-panel" className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h4 className="text-[13px] font-semibold tracking-tight text-ink">
          Accessories for AXIS {cameraModel}
        </h4>
        <span className="text-[11px] tabular-nums text-ink-faint">
          {filteredAccessories.length} item
          {filteredAccessories.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Filter tabs */}
      {availableTabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Filter accessories by type"
          className={cn(
            'inline-flex flex-wrap items-center gap-1 rounded-full',
            'border border-hairline bg-surface-2 p-1'
          )}
        >
          <LayoutGroup id="accessory-filter">
            {availableTabs.map((tab) => {
              const isActive = tab.value === selectedTab;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  // `value` attribute kept for backwards-compat with existing tests
                  // that read `tab.getAttribute('value')`.
                  // eslint-disable-next-line react/no-unknown-property
                  {...({ value: tab.value } as { value: string })}
                  aria-selected={isActive}
                  onClick={() => handleSelectTab(tab.value)}
                  className={cn(
                    'relative z-10 inline-flex h-7 select-none items-center rounded-full px-3 text-[12px] font-medium transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-2',
                    isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="accessory-filter-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-surface shadow-sm"
                      transition={{
                        type: 'spring',
                        stiffness: 520,
                        damping: 38,
                        mass: 0.6,
                      }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </LayoutGroup>
        </div>
      )}

      {/* List */}
      {filteredAccessories.length === 0 ? (
        <Card className="px-4 py-6 text-center text-[13px] text-ink-muted">
          No accessories found
        </Card>
      ) : (
        <Card className="overflow-hidden p-1">
          <motion.ul layout className="flex flex-col">
              {filteredAccessories.map((acc, idx) => {
                const inCart = cartAccessoryModels?.has(acc.model) ?? false;
                const msrp = getMsrpDisplay(acc.msrpKey);
                const Icon = iconFor(acc.accessoryType);
                const isRecommended = acc.recommendation === 'recommended';
                const isLast = idx === filteredAccessories.length - 1;

                return (
                  <motion.li
                    key={acc.model}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 460,
                      damping: 34,
                      mass: 0.6,
                    }}
                    data-testid={`accessory-row-${acc.model}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5',
                      !isLast && 'border-b border-hairline/60'
                    )}
                  >
                    {/* Leading icon */}
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md',
                        'bg-surface-2 text-ink-muted'
                      )}
                      aria-hidden
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </div>

                    {/* Center: name + badges */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[12px] font-semibold text-ink">
                          {acc.model}
                        </span>
                        {isRecommended ? (
                          <Badge variant="success" className="gap-0.5">
                            <Star className="size-2.5" strokeWidth={2.5} />
                            Recommended
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-ink-faint">
                            Compatible
                          </Badge>
                        )}
                        {acc.requiresAdditional && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-warning">
                            <AlertTriangle
                              className="size-2.5"
                              strokeWidth={2.5}
                            />
                            Requires additional accessory
                          </span>
                        )}
                      </div>
                      <span className="truncate text-[12px] text-ink-muted">
                        {acc.displayName}
                      </span>
                      {acc.description && (
                        <span className="truncate text-[11px] text-ink-faint">
                          {acc.description}
                        </span>
                      )}
                    </div>

                    {/* Trailing: price + add */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-[12px] tabular-nums text-ink-muted">
                        {msrp}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={inCart}
                        onClick={() => onAddToCart(acc)}
                        className={cn(
                          'h-7 gap-1 px-2.5 text-[12px]',
                          inCart && 'opacity-60'
                        )}
                      >
                        {inCart ? (
                          <>
                            <Check className="size-3" strokeWidth={2.5} />
                            In BOM
                          </>
                        ) : (
                          <>
                            <Plus className="size-3" strokeWidth={2.5} />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
          </motion.ul>
        </Card>
      )}
    </div>
  );
}

export const AccessoryPanel = memo(AccessoryPanelComponent);
AccessoryPanel.displayName = 'AccessoryPanel';
