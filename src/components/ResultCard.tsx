/**
 * ResultCard — Apple/Swift visual rewrite (Tailwind v4 + shadcn + Framer Motion).
 *
 * Layout:
 *   [hero row]   competitor (left)  ->  axis camera w/ product image (right)
 *   [chips]      up to 4 spec pills (resolution, fps, codec, poe, analytics)
 *   [details]    progressive disclosure: why-switch, features, migration note,
 *                accessories panel
 *   [actions]    View on Axis.com (outline) + Add to BOM (yellow)
 *   [quick add]  +1 / +2 / +4 / +8 / +16 ghost cluster
 *
 * Backwards-compatible with the original Fluent-UI version's props.
 */

import { memo, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';
import type {
  SearchResult,
  CompetitorMapping,
  LegacyAxisMapping,
  AccessoryCompatEntry,
} from '@/types';
import { getFormattedPrice } from '@/core/msrp';
import { lookupSpec } from '@/core/specs';
import { useAccessory } from '@/hooks/useAccessory';
import { AccessoryPanel } from './AccessoryPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCameraImage, CAMERA_PLACEHOLDER_SVG } from '@/lib/cameraImage';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface ResultCardProps {
  /** The search result to display */
  readonly result: SearchResult;

  /** Callback when "Add to BOM" is clicked with quantity */
  readonly onAddToCart: (result: SearchResult, quantity?: number) => void;

  /** Callback when an accessory is added to BOM */
  readonly onAddAccessoryToCart?: (
    accessory: AccessoryCompatEntry,
    parentModel: string
  ) => void;

  /** Set of accessory model keys already in cart */
  readonly cartAccessoryModels?: ReadonlySet<string>;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Why-switch selling points keyed off result.category. */
function getWhySwitchPoints(category: string): string[] {
  const points: string[] = [];
  switch (category) {
    case 'ndaa':
      points.push('NDAA Section 889 compliant - required for federal contracts');
      points.push('No mandatory cloud subscription - own your data');
      break;
    case 'cloud':
      points.push('One-time purchase, no recurring subscription fees');
      points.push('No forced cloud dependency - local storage options');
      break;
  }
  points.push('Open platform - works with any ONVIF-compatible VMS');
  points.push('Edge analytics included at no additional cost');
  return points;
}

/** Map result.category onto a manufacturer-chip Badge variant. */
function manufacturerVariant(
  category: string
): 'destructive' | 'cloud' | 'legacy' | 'default' {
  switch (category) {
    case 'ndaa':
      return 'destructive';
    case 'cloud':
      return 'cloud';
    case 'legacy-axis':
      return 'legacy';
    default:
      return 'default';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

function ResultCardComponent({
  result,
  onAddToCart,
  onAddAccessoryToCart,
  cartAccessoryModels,
}: ResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAccessories, setShowAccessories] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { getAccessories, isLoaded: accessoryLoaded } = useAccessory();

  const mapping = result.mapping;
  const isLegacy = result.isLegacy;

  // Discriminate competitor vs legacy mapping shape.
  const competitorModel = isLegacy
    ? (mapping as LegacyAxisMapping).legacy_model
    : (mapping as CompetitorMapping).competitor_model;

  const axisModel = isLegacy
    ? (mapping as LegacyAxisMapping).replacement_model
    : (mapping as CompetitorMapping).axis_replacement;

  const manufacturer = isLegacy
    ? 'Axis (Legacy)'
    : (mapping as CompetitorMapping).competitor_manufacturer;

  const competitorMapping = isLegacy ? null : (mapping as CompetitorMapping);
  const competitorResolution = competitorMapping?.competitor_resolution;
  const competitorType = competitorMapping?.competitor_type;
  const axisFeatures = competitorMapping?.axis_features;
  const notes = mapping.notes;

  const msrpDisplay = getFormattedPrice(axisModel);

  // Enriched specs (silently skip if database isn't initialised).
  const axisSpec = useMemo(() => {
    try {
      return lookupSpec(axisModel);
    } catch {
      return null;
    }
  }, [axisModel]);

  // Accessory data (lazy — only built when the panel is opened).
  const accessories = useMemo(
    () => (accessoryLoaded && showAccessories ? getAccessories(axisModel) : []),
    [accessoryLoaded, showAccessories, getAccessories, axisModel]
  );

  const handleToggleAccessories = useCallback(() => {
    setShowAccessories((prev) => !prev);
  }, []);

  const handleAddAccessory = useCallback(
    (accessory: AccessoryCompatEntry) => {
      onAddAccessoryToCart?.(accessory, axisModel);
    },
    [onAddAccessoryToCart, axisModel]
  );

  const isHighConfidence = result.score >= 85;

  // Build the spec-chip list (cap at the 4 most useful for the hero row).
  const specChips: { label: string; value: string }[] = [];
  if (axisSpec) {
    if (axisSpec.maxResolution) {
      specChips.push({ label: 'Res', value: axisSpec.maxResolution });
    }
    if (axisSpec.maxFps) {
      specChips.push({ label: 'FPS', value: String(axisSpec.maxFps) });
    }
    const firstCodec = axisSpec.codecs[0];
    if (firstCodec) {
      specChips.push({ label: 'Codec', value: firstCodec });
    }
    const poe = axisSpec.poeTypeClass || axisSpec.powerType;
    if (poe) {
      specChips.push({ label: 'PoE', value: poe });
    }
    if (axisSpec.analytics.length > 0 && specChips.length < 4) {
      specChips.push({
        label: 'Analytics',
        value: String(axisSpec.analytics.length),
      });
    }
  }
  const visibleChips = specChips.slice(0, 4);

  const productImageUrl = getCameraImage(axisModel);
  const imgRef = useRef<HTMLImageElement | null>(null);

  return (
    <motion.div
      data-swift
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.6 }}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-hairline bg-surface p-5',
        'shadow-sm transition-all duration-150 ease-out',
        'hover:border-[oklch(0.86_0_0)] hover:shadow-md'
      )}
    >
      {/* Confidence pill — top-right, text-only */}
      <div className="absolute right-4 top-4 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide">
        {isHighConfidence ? (
          <>
            <CheckCircle className="size-3 text-success" />
            <span className="text-success">HIGH</span>
          </>
        ) : (
          <>
            <AlertTriangle className="size-3 text-warning" />
            <span className="text-warning">MEDIUM</span>
          </>
        )}
      </div>

      {/* Hero comparison row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 pr-16">
        {/* LEFT — competitor */}
        <div className="flex min-w-0 flex-col gap-2">
          <Badge variant={manufacturerVariant(result.category)}>
            {manufacturer}
          </Badge>
          <div className="font-mono text-[15px] font-semibold text-ink truncate">
            {competitorModel}
          </div>
          {!isLegacy && (competitorResolution || competitorType) && (
            <div className="text-[12px] text-ink-muted truncate">
              {competitorResolution || '—'}
              <span className="mx-1.5 opacity-40">•</span>
              {competitorType || '—'}
            </div>
          )}
        </div>

        {/* MIDDLE — arrow */}
        <div className="flex items-center justify-center text-ink-faint">
          <ArrowRight className="size-4" strokeWidth={2} />
        </div>

        {/* RIGHT — Axis camera image + label */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'relative flex size-[88px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-2',
              'shadow-[inset_0_0_0_1px_oklch(0_0_0/0.04),inset_0_2px_4px_oklch(0_0_0/0.03)]'
            )}
          >
            {imageFailed ? (
              <div
                className="flex size-full items-center justify-center text-ink-faint"
                aria-label={`${axisModel} placeholder`}
                role="img"
              >
                <img
                  src={CAMERA_PLACEHOLDER_SVG}
                  alt=""
                  className="size-12 opacity-60"
                />
              </div>
            ) : (
              <img
                ref={imgRef}
                src={productImageUrl}
                alt={`AXIS ${axisModel}`}
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="size-full object-contain p-1.5"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Badge variant="outline" className="w-fit border-hairline text-[10px] tracking-[0.08em] text-ink-muted uppercase">
              AXIS
            </Badge>
            <div className="font-mono text-[15px] font-semibold text-ink truncate">
              {axisModel}
            </div>
            <div className="font-mono text-[12px] tabular-nums text-ink-muted">
              {msrpDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* Spec chips row */}
      {visibleChips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visibleChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] text-ink-muted"
            >
              <span className="text-ink-faint">{chip.label}</span>
              <span className="mx-1 opacity-40">·</span>
              <span className="font-medium text-ink">{chip.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Details toggle — sits under hero, right-aligned */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowDetails((p) => !p)}
          aria-expanded={showDetails}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-ink-muted',
            'transition-colors hover:text-ink hover:bg-secondary'
          )}
        >
          {showDetails ? 'Hide details' : 'Show details'}
          <motion.span
            animate={{ rotate: showDetails ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="inline-flex"
          >
            <ChevronDown className="size-3.5" />
          </motion.span>
        </button>
      </div>

      {/* Progressive disclosure */}
      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-2 flex flex-col gap-4">
              {/* Why switch */}
              {!isLegacy && (
                <section>
                  <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    Why switch to Axis?
                  </h4>
                  <ul className="flex flex-col gap-1 text-[13px] leading-snug text-ink">
                    {getWhySwitchPoints(result.category).map((point, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 inline-block size-1 shrink-0 rounded-full bg-success/70" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Axis features */}
              {axisFeatures && axisFeatures.length > 0 && (
                <section>
                  <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    Key features
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {axisFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-axis-yellow-soft px-2 py-0.5 text-[11px] font-medium text-axis-yellow-ink"
                      >
                        <Sparkles className="size-3" strokeWidth={2} />
                        + {feature}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Migration note */}
              {notes && (
                <section
                  className={cn(
                    'flex items-start gap-2 rounded-md border border-warning/20 bg-warning/8 px-3 py-2',
                    'text-[13px] leading-snug text-ink'
                  )}
                >
                  <Info className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  <div>
                    <span className="font-semibold text-warning">
                      Migration Note:
                    </span>{' '}
                    <span className="text-ink-muted">{notes}</span>
                  </div>
                </section>
              )}

              {/* Accessories */}
              {accessoryLoaded && (
                <section>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleAccessories}
                    aria-expanded={showAccessories}
                    className="h-7 px-2 text-[12px]"
                  >
                    <ChevronDown
                      className={cn(
                        'size-3.5 transition-transform',
                        showAccessories && 'rotate-180'
                      )}
                    />
                    {showAccessories ? 'Hide accessories' : 'Show accessories'}
                  </Button>

                  {showAccessories && accessories.length > 0 && (
                    <div className="mt-2">
                      <AccessoryPanel
                        cameraModel={axisModel}
                        accessories={accessories}
                        onAddToCart={handleAddAccessory}
                        cartAccessoryModels={cartAccessoryModels}
                      />
                    </div>
                  )}
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action row */}
      <div className="mt-4 flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-[13px]"
        >
          <a
            href={result.axisUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-3.5" />
            View on Axis.com
          </a>
        </Button>
        <Button
          type="button"
          onClick={() => onAddToCart(result, 1)}
          size="sm"
          className="h-9 gap-1.5 bg-axis-yellow text-ink shadow-sm hover:brightness-105 active:brightness-95"
        >
          <Plus className="size-3.5" />
          Add to BOM
        </Button>
      </div>

      {/* Quick-add cluster */}
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[11px] text-ink-faint">Quick add</span>
        {[1, 2, 4, 8, 16].map((qty) => (
          <button
            key={qty}
            type="button"
            onClick={() => onAddToCart(result, qty)}
            className={cn(
              'inline-flex h-6 min-w-7 items-center justify-center rounded-full px-2',
              'text-[11px] font-medium text-ink-muted',
              'transition-colors hover:bg-secondary hover:text-ink'
            )}
          >
            +{qty}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export const ResultCard = memo(
  ResultCardComponent,
  (prev, next) =>
    prev.result === next.result &&
    prev.onAddToCart === next.onAddToCart &&
    prev.onAddAccessoryToCart === next.onAddAccessoryToCart &&
    prev.cartAccessoryModels === next.cartAccessoryModels
);
ResultCard.displayName = 'ResultCard';
