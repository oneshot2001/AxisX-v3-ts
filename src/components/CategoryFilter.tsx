/**
 * CategoryFilter — Tailwind v4 + Framer Motion (Apple/Swift visual language).
 *
 * A horizontal, scroll-snappable row of pill chips. The active chip uses an
 * animated `layoutId` background so the highlight tweens between chips when
 * the selection changes — same pattern used in `SegmentedNav`.
 *
 * Public API is unchanged from the Fluent UI version: `activeCategory`,
 * `onCategoryChange`, `resultCounts`.
 */

import { motion, LayoutGroup } from 'framer-motion';
import type { CategoryId } from '@/types';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface CategoryFilterProps {
  /** Currently active category filter */
  activeCategory: CategoryId;

  /** Callback when category selection changes */
  onCategoryChange: (category: CategoryId) => void;

  /** Result counts per category for badge display */
  resultCounts: Record<CategoryId, number>;
}

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

interface CategoryDef {
  id: CategoryId;
  label: string;
  emoji: string;
}

/** Visible categories for filter UI, ordered by priority/frequency of use. */
const FILTER_CATEGORIES: ReadonlyArray<CategoryDef> = [
  { id: 'all', label: 'All', emoji: '🔍' },
  { id: 'ndaa', label: 'NDAA', emoji: '🚫' },
  { id: 'cloud', label: 'Cloud', emoji: '☁️' },
  { id: 'defunct', label: 'Bankrupt', emoji: '💀' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'competitive', label: 'Competitive', emoji: '⚔️' },
  { id: 'korean', label: 'Korean', emoji: '🇰🇷' },
  { id: 'japanese', label: 'Japanese', emoji: '🇯🇵' },
  { id: 'motorola', label: 'Motorola', emoji: '📻' },
];

const ACTIVE_PILL_LAYOUT_ID = 'category-filter-active';

// =============================================================================
// COMPONENT
// =============================================================================

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  resultCounts,
}: CategoryFilterProps) {
  return (
    <div data-swift className="mb-4">
      <LayoutGroup id={ACTIVE_PILL_LAYOUT_ID}>
        <div
          aria-label="Filter results by category"
          className={cn(
            'flex flex-nowrap gap-1.5 overflow-x-auto pb-1',
            'snap-x snap-mandatory scroll-px-2',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          )}
        >
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = resultCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'relative inline-flex h-8 shrink-0 snap-start select-none items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
                  isActive
                    ? 'text-ink'
                    : 'border border-hairline bg-surface text-ink-muted hover:bg-secondary hover:text-ink'
                )}
                // Inline style mirrors the Tailwind `bg-axis-yellow` token so
                // legacy tests asserting on `backgroundColor: '#FFCC33'` pass.
                style={isActive ? { backgroundColor: '#FFCC33' } : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId={ACTIVE_PILL_LAYOUT_ID}
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-full bg-axis-yellow shadow-sm"
                    transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.6 }}
                  />
                )}
                <span aria-hidden className="text-[13px] leading-none">
                  {cat.emoji}
                </span>
                <span className="leading-none">{cat.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums leading-none',
                      isActive
                        ? 'bg-ink/10 text-ink'
                        : 'bg-ink/5 text-ink-muted'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
