/**
 * SearchResults — Tailwind v4 + Framer Motion (Apple/Swift visual language).
 *
 * Displays search results grouped by match quality:
 *   - Exact Matches  (score >= 90)   — success-green count chip
 *   - Partial Matches (70-89)        — warning-amber count chip
 *   - Similar Matches (50-69)        — neutral count chip
 *
 * Each section renders as a low-key disclosure row (chevron + name + count
 * chip). The thick yellow left-border from the Fluent version is gone —
 * sections are flat, with subtle hover states only.
 *
 * Public API is unchanged from the Fluent UI version.
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { SearchResponse, SearchResult, CategoryId } from '@/types';
import { ResultCard } from './ResultCard';
import { CategoryFilter } from './CategoryFilter';
import { AxisBrowseResults } from './AxisBrowseResults';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface SearchResultsProps {
  /** Complete search response */
  response: SearchResponse;

  /** Callback when a result is added to cart with optional quantity */
  onAddToCart: (result: SearchResult, quantity?: number) => void;

  /** Callback when a suggestion is clicked */
  onSuggestionClick: (suggestion: string) => void;

  /** Callback when an Axis model is added directly from browse view */
  onAddAxisModel?: (model: string, quantity: number) => void;

  /** Show category filter (default: true) */
  showCategoryFilter?: boolean;
}

type SectionKey = 'exact' | 'partial' | 'similar';

interface SectionMeta {
  key: SectionKey;
  title: string;
  /** Tailwind classes for the count chip — color-coded by tier. */
  chipClass: string;
}

const SECTION_META: Record<SectionKey, SectionMeta> = {
  exact: {
    key: 'exact',
    title: 'Exact Matches',
    chipClass: 'bg-success/10 text-success',
  },
  partial: {
    key: 'partial',
    title: 'Partial Matches',
    chipClass: 'bg-warning/12 text-warning',
  },
  similar: {
    key: 'similar',
    title: 'Similar Matches',
    chipClass: 'bg-secondary text-ink-muted',
  },
};

// =============================================================================
// HELPERS
// =============================================================================

/** Calculate category counts from results. */
function getCategoryCounts(
  results: readonly SearchResult[]
): Record<CategoryId, number> {
  const counts: Record<CategoryId, number> = {
    all: results.length,
    ndaa: 0,
    cloud: 0,
    korean: 0,
    japanese: 0,
    motorola: 0,
    taiwan: 0,
    competitive: 0,
    family: 0,
    defunct: 0,
    'legacy-axis': 0,
  };

  for (const result of results) {
    const category = result.category as CategoryId;
    if (category in counts) {
      counts[category]++;
    }
  }

  return counts;
}

function getResultKey(result: SearchResult, index: number): string {
  const mapping = result.mapping;
  const fromModel =
    'competitor_model' in mapping
      ? mapping.competitor_model
      : mapping.legacy_model;
  const toModel =
    'axis_replacement' in mapping
      ? mapping.axis_replacement
      : mapping.replacement_model;

  return `${result.isLegacy ? 'legacy' : 'competitor'}:${fromModel}:${toModel}:${index}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SearchResults({
  response,
  onAddToCart,
  onSuggestionClick,
  onAddAxisModel,
  showCategoryFilter = true,
}: SearchResultsProps) {
  // Category filter state
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');

  // Calculate category counts from all results (before filtering)
  const categoryCounts = useMemo(
    () => getCategoryCounts(response.results),
    [response.results]
  );

  // Filter results by category
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') {
      return response.results;
    }
    return response.results.filter((r) => r.category === activeCategory);
  }, [response.results, activeCategory]);

  // Group filtered results by quality tier in a single pass.
  const groupedResults = useMemo(() => {
    const exact: SearchResult[] = [];
    const partial: SearchResult[] = [];
    const similar: SearchResult[] = [];

    for (const result of filteredResults) {
      if (result.score >= 90) {
        exact.push(result);
      } else if (result.score >= 70) {
        partial.push(result);
      } else if (result.score >= 50) {
        similar.push(result);
      }
    }

    return { exact, partial, similar };
  }, [filteredResults]);

  const exactMatches = groupedResults.exact;
  const partialMatches = groupedResults.partial;
  const similarMatches = groupedResults.similar;

  const hasExactOrPartial =
    exactMatches.length > 0 || partialMatches.length > 0;

  // Section open/closed state — mirrors the Fluent Accordion behaviour:
  // similar collapsed by default if there are better matches.
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(() => {
    const initial = new Set<SectionKey>();
    if (exactMatches.length > 0) initial.add('exact');
    if (partialMatches.length > 0) initial.add('partial');
    if (!hasExactOrPartial && similarMatches.length > 0) initial.add('similar');
    return initial;
  });

  useEffect(() => {
    const next = new Set<SectionKey>();
    if (exactMatches.length > 0) next.add('exact');
    if (partialMatches.length > 0) next.add('partial');
    if (!hasExactOrPartial && similarMatches.length > 0) next.add('similar');
    setOpenSections(next);
  }, [
    response.query,
    activeCategory,
    exactMatches.length,
    partialMatches.length,
    similarMatches.length,
    hasExactOrPartial,
  ]);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Axis Browse mode — show portfolio catalog instead of search results.
  // (Placed after all hooks to satisfy React Rules of Hooks.)
  if (response.queryType === 'axis-browse' && onAddAxisModel) {
    return <AxisBrowseResults onAddToCart={onAddAxisModel} />;
  }

  // -------------------------------------------------------------------------
  // No results at all — empty state with did-you-mean suggestions
  // -------------------------------------------------------------------------
  if (response.results.length === 0) {
    return (
      <div
        data-swift
        className="flex flex-col items-center justify-center px-6 py-16 text-center"
      >
        <div className="text-[17px] font-semibold tracking-tight text-ink">
          No matches found
        </div>
        <div className="mt-1.5 text-[13px] text-ink-muted">
          Try a different model number or manufacturer.
        </div>

        {response.suggestions.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-[13px] text-ink-muted">
            <span>Did you mean</span>
            {response.suggestions.map((suggestion, i) => (
              <button
                key={`${suggestion}-${i}`}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className={cn(
                  'inline-flex h-7 items-center rounded-full px-2.5 font-medium text-axis-yellow-ink',
                  'underline decoration-axis-yellow-ink/30 underline-offset-4',
                  'transition-colors hover:bg-axis-yellow-soft hover:decoration-axis-yellow-ink',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas'
                )}
              >
                {suggestion}
              </button>
            ))}
            <span className="text-ink-faint">?</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-swift className="flex flex-col">
      {/* Category Filter */}
      {showCategoryFilter && (
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          resultCounts={categoryCounts}
        />
      )}

      {/* Results metadata */}
      <div className="mb-4 text-[12px] tabular-nums text-ink-muted">
        <span className="font-medium text-ink">{filteredResults.length}</span>
        {' results'}
        {activeCategory !== 'all' && (
          <span className="text-ink-faint">
            {' '}(filtered from {response.results.length})
          </span>
        )}
        <span className="mx-1.5 opacity-40">•</span>
        <span className="capitalize">{response.confidence}</span>
        {' confidence'}
        <span className="mx-1.5 opacity-40">•</span>
        {response.durationMs.toFixed(1)}ms
      </div>

      {/* No results after filtering */}
      {filteredResults.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="text-[14px] text-ink-muted">
            No results in this category.
          </div>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              'mt-2 inline-flex h-7 items-center rounded-full px-2.5 text-[13px] font-medium text-axis-yellow-ink underline decoration-axis-yellow-ink/30 underline-offset-4',
              'transition-colors hover:bg-axis-yellow-soft hover:decoration-axis-yellow-ink',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas'
            )}
          >
            Show all results
          </button>
        </div>
      )}

      {/* Grouped sections */}
      <div className="flex flex-col gap-2">
        {exactMatches.length > 0 && (
          <ResultSection
            meta={SECTION_META.exact}
            count={exactMatches.length}
            isOpen={openSections.has('exact')}
            onToggle={() => toggleSection('exact')}
          >
            {exactMatches.map((result, index) => (
              <ResultCard
                key={getResultKey(result, index)}
                result={result}
                onAddToCart={onAddToCart}
              />
            ))}
          </ResultSection>
        )}

        {partialMatches.length > 0 && (
          <ResultSection
            meta={SECTION_META.partial}
            count={partialMatches.length}
            isOpen={openSections.has('partial')}
            onToggle={() => toggleSection('partial')}
          >
            {partialMatches.map((result, index) => (
              <ResultCard
                key={getResultKey(result, index)}
                result={result}
                onAddToCart={onAddToCart}
              />
            ))}
          </ResultSection>
        )}

        {similarMatches.length > 0 && (
          <ResultSection
            meta={SECTION_META.similar}
            count={similarMatches.length}
            isOpen={openSections.has('similar')}
            onToggle={() => toggleSection('similar')}
          >
            {similarMatches.map((result, index) => (
              <ResultCard
                key={getResultKey(result, index)}
                result={result}
                onAddToCart={onAddToCart}
              />
            ))}
          </ResultSection>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SECTION — disclosure row + animated reveal
// =============================================================================

interface ResultSectionProps {
  meta: SectionMeta;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ResultSection({
  meta,
  count,
  isOpen,
  onToggle,
  children,
}: ResultSectionProps) {
  return (
    <section className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          'group flex h-10 w-full items-center gap-2 rounded-md px-2 text-left',
          'transition-colors duration-150 hover:bg-secondary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axis-yellow/60 focus-visible:ring-offset-1 focus-visible:ring-offset-canvas'
        )}
      >
        <motion.span
          aria-hidden
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 480, damping: 34 }}
          className="inline-flex text-ink-faint group-hover:text-ink-muted"
        >
          <ChevronDown className="size-3.5" strokeWidth={2.25} />
        </motion.span>
        <span className="text-[13px] font-semibold tracking-tight text-ink">
          {meta.title}
        </span>
        <span
          className={cn(
            'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-none',
            meta.chipClass
          )}
        >
          {count}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-3 px-1 pb-2 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
