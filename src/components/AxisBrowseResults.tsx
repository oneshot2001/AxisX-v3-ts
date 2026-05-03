/**
 * AxisBrowseResults — Apple/Swift visual rewrite (Tailwind v4 + shadcn +
 * Framer Motion).
 *
 * Layout:
 *   [header]    "Axis Communications Portfolio" + total-model count pill
 *   [chips]     Sticky family/category quick-jump nav (SegmentedNav layoutId
 *               motion). Click scrolls to the matching section; "All" resets.
 *               Chips use a SHORT label (first word, e.g. "Dome", "PTZ") so
 *               the section heading remains the canonical full label and
 *               consumers can `getByText(category.label)` unambiguously.
 *   [sections]  One section per CatalogCategory containing a responsive grid
 *               of camera tiles (lg=3 / md=2 / sm=1). Each tile mirrors the
 *               ResultCard product-image pattern (96-112px square + wireframe
 *               fallback), shows model + series ID + MSRP, and an outline
 *               "Add to BOM" Button. The full series label + description live
 *               in a legend strip above the grid (single source of text).
 *
 * Backwards-compatible with the original Fluent-UI props
 * (`onAddToCart(model, qty)`).
 */

import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { ExternalLink, Plus } from 'lucide-react';
import { AXIS_CATALOG, getCatalogModelCount } from '@/data/axisCatalog';
import type { CatalogCategory } from '@/data/axisCatalog';
import { getFormattedPrice } from '@/core/msrp';
import { getAxisURL } from '@/core/url';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCameraImage, CAMERA_PLACEHOLDER_SVG } from '@/lib/cameraImage';
import { cn } from '@/lib/utils';

// =============================================================================
// HELPERS
// =============================================================================

function getCategoryModelCount(category: CatalogCategory): number {
  return category.series.reduce((sum, s) => sum + s.models.length, 0);
}

/** Short label for the sticky chip nav. First word of the label, which keeps
 *  the chip text distinct from the canonical section heading text. */
function shortCategoryLabel(label: string): string {
  return label.split(/[\s/&]/, 1)[0] ?? label;
}

// =============================================================================
// TYPES
// =============================================================================

export interface AxisBrowseResultsProps {
  onAddToCart: (model: string, quantity: number) => void;
}

// =============================================================================
// MODEL TILE
// =============================================================================

interface ModelTileProps {
  model: string;
  /** The series identifier (e.g. "M30") — short, fits in a chip and avoids
   *  duplicating the full series label which lives in the legend strip. */
  seriesId: string;
  onAddToCart: (model: string, quantity: number) => void;
}

const ModelTile = memo(function ModelTile({
  model,
  seriesId,
  onAddToCart,
}: ModelTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const productImageUrl = useMemo(() => getCameraImage(model), [model]);
  const msrpDisplay = getFormattedPrice(model);
  const axisUrl = getAxisURL(model);

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.6 }}
      className={cn(
        'group flex flex-col gap-3 rounded-lg border border-hairline bg-surface p-4',
        'shadow-sm transition-colors duration-150 ease-out',
        'hover:border-[oklch(0.86_0_0)] hover:shadow-md'
      )}
    >
      {/* Hero row — image tile + model + family + price */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'relative flex size-[104px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-2',
            'shadow-[inset_0_0_0_1px_oklch(0_0_0/0.04),inset_0_2px_4px_oklch(0_0_0/0.03)]'
          )}
        >
          {imageFailed ? (
            <div
              className="flex size-full items-center justify-center text-ink-faint"
              aria-label={`${model} placeholder`}
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
              src={productImageUrl}
              alt={`AXIS ${model}`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="size-full object-contain p-1.5"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <Badge
            variant="outline"
            className="w-fit border-hairline text-[10px] tracking-[0.08em] text-ink-muted uppercase"
            aria-label={`Series ${seriesId}`}
          >
            {seriesId}
          </Badge>
          <div
            className="font-mono text-[15px] font-semibold text-ink truncate"
            title={model}
          >
            {model}
          </div>
          <div className="font-mono text-[12px] tabular-nums text-ink-muted">
            {msrpDisplay}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="mt-auto flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 flex-1 gap-1.5 text-[12px]"
        >
          <a href={axisUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            Axis.com
          </a>
        </Button>
        <Button
          type="button"
          onClick={() => onAddToCart(model, 1)}
          variant="outline"
          size="sm"
          className={cn(
            'h-8 flex-1 gap-1.5 text-[12px]',
            'border-axis-yellow/40 bg-axis-yellow-soft text-axis-yellow-ink',
            'hover:bg-axis-yellow hover:text-ink'
          )}
        >
          <Plus className="size-3.5" />
          Add to BOM
        </Button>
      </div>
    </motion.div>
  );
});

// =============================================================================
// CATEGORY SECTION
// =============================================================================

interface CategorySectionProps {
  category: CatalogCategory;
  registerRef: (id: string, el: HTMLElement | null) => void;
  onAddToCart: (model: string, quantity: number) => void;
}

function CategorySection({
  category,
  registerRef,
  onAddToCart,
}: CategorySectionProps) {
  const count = getCategoryModelCount(category);

  // Flatten models with their series id (used as a per-tile chip). The full
  // series label + description live in the legend strip above the grid.
  const tiles: { model: string; seriesId: string }[] = [];
  const seriesIndex: { id: string; label: string; description: string }[] = [];
  for (const series of category.series) {
    seriesIndex.push({
      id: series.id,
      label: series.label,
      description: series.description,
    });
    for (const model of series.models) {
      tiles.push({ model, seriesId: series.id });
    }
  }

  return (
    <section
      ref={(el) => registerRef(category.id, el)}
      id={`axis-cat-${category.id}`}
      className="scroll-mt-32"
      aria-labelledby={`axis-cat-${category.id}-h`}
    >
      <header className="mb-3 flex items-baseline gap-2.5">
        <h2
          id={`axis-cat-${category.id}-h`}
          className="text-[18px] font-semibold tracking-tight text-ink"
        >
          {category.label}
        </h2>
        <span
          className={cn(
            'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5',
            'bg-axis-yellow text-[11px] font-semibold tabular-nums text-ink'
          )}
        >
          {count}
        </span>
        <p className="text-[12px] text-ink-muted">{category.description}</p>
      </header>

      {/* Series legend — single source of truth for series labels +
          descriptions. Per-tile chip uses series.id only. */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 rounded-md border border-hairline bg-surface-2 px-3 py-2">
        {seriesIndex.map((s) => (
          <span key={s.id} className="text-[11px] text-ink-muted">
            <span className="font-semibold text-ink">{s.label}</span>
            <span className="mx-1 opacity-40">·</span>
            <span className="italic text-ink-faint">{s.description}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ model, seriesId }) => (
          <ModelTile
            key={model}
            model={model}
            seriesId={seriesId}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AxisBrowseResults({ onAddToCart }: AxisBrowseResultsProps) {
  const totalModels = getCatalogModelCount();
  const [activeChip, setActiveChip] = useState<string>('all');
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  }, []);

  const handleChipClick = useCallback((id: string) => {
    setActiveChip(id);
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = sectionRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div data-swift className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">
          Axis Communications Portfolio
        </h1>
        <span
          className={cn(
            'inline-flex items-center rounded-full bg-axis-yellow px-2.5 py-0.5',
            'text-[11px] font-semibold tabular-nums text-ink'
          )}
        >
          {totalModels} models
        </span>
      </div>

      {/* Sticky family/category chips */}
      <LayoutGroup id="axis-browse-chips">
        <div
          className={cn(
            'sticky top-14 z-30 -mx-2 overflow-x-auto px-2 py-2',
            'bg-[oklch(1_0_0/0.72)] backdrop-blur-xl backdrop-saturate-150',
            'border-b border-hairline/60'
          )}
        >
          <div
            role="tablist"
            aria-label="Jump to camera category"
            className="flex w-max items-center gap-1 rounded-full border border-hairline bg-[oklch(0.97_0_0/0.7)] p-1 backdrop-blur-md"
          >
            <CategoryChip
              id="all"
              label="All"
              fullLabel="All categories"
              active={activeChip === 'all'}
              onClick={handleChipClick}
            />
            {AXIS_CATALOG.map((category) => (
              <CategoryChip
                key={category.id}
                id={category.id}
                label={shortCategoryLabel(category.label)}
                fullLabel={category.label}
                active={activeChip === category.id}
                onClick={handleChipClick}
              />
            ))}
          </div>
        </div>
      </LayoutGroup>

      {/* Category sections (grid of cards) */}
      <div className="flex flex-col gap-10">
        {AXIS_CATALOG.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            registerRef={registerRef}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CATEGORY CHIP
// =============================================================================

interface CategoryChipProps {
  id: string;
  /** Visible chip text — short to leave the section heading as the canonical
   *  full label and keep things scannable on mobile. */
  label: string;
  /** Full descriptive label, surfaced via aria-label / title for screen
   *  readers and tooltips. */
  fullLabel: string;
  active: boolean;
  onClick: (id: string) => void;
}

function CategoryChip({
  id,
  label,
  fullLabel,
  active,
  onClick,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={fullLabel}
      title={fullLabel}
      onClick={() => onClick(id)}
      className={cn(
        'relative z-10 inline-flex h-8 select-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
        active ? 'text-ink' : 'text-ink-muted hover:text-ink'
      )}
    >
      {active && (
        <motion.span
          layoutId="axis-browse-chip-active"
          className="absolute inset-0 -z-10 rounded-full bg-surface shadow-sm"
          transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.6 }}
        />
      )}
      {label}
    </button>
  );
}
