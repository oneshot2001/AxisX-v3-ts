/**
 * SearchResults Component
 *
 * Displays search results grouped by match quality:
 * - Exact Matches (score >= 90)
 * - Partial Matches (70-89)
 * - Similar Matches (50-69)
 *
 * Includes optional category filtering via CategoryFilter component.
 * Sections are collapsible with expandable headers using Fluent UI Accordion.
 *
 * Migrated to Fluent UI components.
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Button,
  Text,
  makeStyles,
  tokens,
  mergeClasses,
} from '@fluentui/react-components';
import type { SearchResponse, SearchResult, CategoryId } from '@/types';
import { ResultCard } from './ResultCard';
import { CategoryFilter } from './CategoryFilter';
import { AxisBrowseResults } from './AxisBrowseResults';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {},
  metadata: {
    marginBottom: '1rem',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  noResults: {
    textAlign: 'center',
    padding: '2rem',
    color: tokens.colorNeutralForeground3,
  },
  noResultsTitle: {
    fontSize: tokens.fontSizeBase500,
    marginBottom: '0.5rem',
  },
  suggestionButton: {
    marginLeft: '0.5rem',
    textDecoration: 'underline',
  },
  accordionItem: {
    marginBottom: '1rem',
  },
  accordionHeader: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  headerExact: {
    borderLeftColor: axisTokens.success,
  },
  headerPartial: {
    borderLeftColor: axisTokens.warning,
  },
  headerSimilar: {
    borderLeftColor: tokens.colorNeutralForeground3,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  headerTitle: {
    fontWeight: tokens.fontWeightSemibold,
  },
  countBadge: {
    color: '#fff',
    padding: '0.125rem 0.5rem',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  countBadgeExact: {
    backgroundColor: axisTokens.success,
  },
  countBadgePartial: {
    backgroundColor: axisTokens.warning,
  },
  countBadgeSimilar: {
    backgroundColor: tokens.colorNeutralForeground3,
  },
  accordionPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingTop: '0.75rem',
  },
  filteredEmpty: {
    textAlign: 'center',
    padding: '2rem',
    color: tokens.colorNeutralForeground3,
  },
});

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

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Calculate category counts from results
 */
function getCategoryCounts(results: readonly SearchResult[]): Record<CategoryId, number> {
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
  const fromModel = 'competitor_model' in mapping
    ? mapping.competitor_model
    : mapping.legacy_model;
  const toModel = 'axis_replacement' in mapping
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
  const styles = useStyles();

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

  const hasExactOrPartial = exactMatches.length > 0 || partialMatches.length > 0;

  // Accordion open items - similar collapsed by default if better matches exist
  const [openItems, setOpenItems] = useState<string[]>(() => {
    const initial: string[] = [];
    if (exactMatches.length > 0) initial.push('exact');
    if (partialMatches.length > 0) initial.push('partial');
    if (!hasExactOrPartial && similarMatches.length > 0) initial.push('similar');
    return initial;
  });

  useEffect(() => {
    const nextOpenItems: string[] = [];
    if (exactMatches.length > 0) nextOpenItems.push('exact');
    if (partialMatches.length > 0) nextOpenItems.push('partial');
    if (!hasExactOrPartial && similarMatches.length > 0) nextOpenItems.push('similar');
    setOpenItems(nextOpenItems);
  }, [
    response.query,
    activeCategory,
    exactMatches.length,
    partialMatches.length,
    similarMatches.length,
    hasExactOrPartial,
  ]);

  // Axis Browse mode — show portfolio catalog instead of search results
  // (placed after all hooks to satisfy React Rules of Hooks)
  if (response.queryType === 'axis-browse' && onAddAxisModel) {
    return <AxisBrowseResults onAddToCart={onAddAxisModel} />;
  }

  // No results at all
  if (response.results.length === 0) {
    return (
      <div className={styles.noResults}>
        <Text className={styles.noResultsTitle} block>
          No matches found
        </Text>
        <Text block>Try a different model number or manufacturer</Text>

        {response.suggestions.length > 0 && (
          <Text block style={{ marginTop: '1rem' }}>
            Did you mean:{' '}
            {response.suggestions.map((suggestion, i) => (
              <Button
                key={i}
                onClick={() => onSuggestionClick(suggestion)}
                appearance="transparent"
                className={styles.suggestionButton}
                style={{ color: axisTokens.primary }}
              >
                {suggestion}
              </Button>
            ))}
          </Text>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Category Filter */}
      {showCategoryFilter && (
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          resultCounts={categoryCounts}
        />
      )}

      {/* Results metadata */}
      <Text className={styles.metadata} block>
        {filteredResults.length} results
        {activeCategory !== 'all' && ` (filtered from ${response.results.length})`}
        {' '}\u2022 {response.confidence} confidence \u2022 {response.durationMs.toFixed(1)}ms
      </Text>

      {/* No results after filtering */}
      {filteredResults.length === 0 && (
        <div className={styles.filteredEmpty}>
          <Text block>No results in this category</Text>
          <Button
            onClick={() => setActiveCategory('all')}
            appearance="transparent"
            style={{ marginTop: '0.5rem', color: axisTokens.primary, textDecoration: 'underline' }}
          >
            Show all results
          </Button>
        </div>
      )}

      {/* Grouped sections using Accordion */}
      <Accordion
        multiple
        collapsible
        openItems={openItems}
        onToggle={(_, data) => setOpenItems(data.openItems as string[])}
      >
        {/* Exact Matches */}
        {exactMatches.length > 0 && (
          <AccordionItem value="exact" className={styles.accordionItem}>
            <AccordionHeader
              className={mergeClasses(styles.accordionHeader, styles.headerExact)}
            >
              <div className={styles.headerContent}>
                <Text className={styles.headerTitle}>Exact Matches</Text>
                <span className={mergeClasses(styles.countBadge, styles.countBadgeExact)}>
                  {exactMatches.length}
                </span>
              </div>
            </AccordionHeader>
            <AccordionPanel className={styles.accordionPanel}>
              {exactMatches.map((result, index) => (
                <ResultCard
                  key={getResultKey(result, index)}
                  result={result}
                  onAddToCart={onAddToCart}
                />
              ))}
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Partial Matches */}
        {partialMatches.length > 0 && (
          <AccordionItem value="partial" className={styles.accordionItem}>
            <AccordionHeader
              className={mergeClasses(styles.accordionHeader, styles.headerPartial)}
            >
              <div className={styles.headerContent}>
                <Text className={styles.headerTitle}>Partial Matches</Text>
                <span className={mergeClasses(styles.countBadge, styles.countBadgePartial)}>
                  {partialMatches.length}
                </span>
              </div>
            </AccordionHeader>
            <AccordionPanel className={styles.accordionPanel}>
              {partialMatches.map((result, index) => (
                <ResultCard
                  key={getResultKey(result, index)}
                  result={result}
                  onAddToCart={onAddToCart}
                />
              ))}
            </AccordionPanel>
          </AccordionItem>
        )}

        {/* Similar Matches */}
        {similarMatches.length > 0 && (
          <AccordionItem value="similar" className={styles.accordionItem}>
            <AccordionHeader
              className={mergeClasses(styles.accordionHeader, styles.headerSimilar)}
            >
              <div className={styles.headerContent}>
                <Text className={styles.headerTitle}>Similar Matches</Text>
                <span className={mergeClasses(styles.countBadge, styles.countBadgeSimilar)}>
                  {similarMatches.length}
                </span>
              </div>
            </AccordionHeader>
            <AccordionPanel className={styles.accordionPanel}>
              {similarMatches.map((result, index) => (
                <ResultCard
                  key={getResultKey(result, index)}
                  result={result}
                  onAddToCart={onAddToCart}
                />
              ))}
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
