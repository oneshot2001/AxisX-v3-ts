/**
 * SearchResults Component
 *
 * Displays search results grouped by match quality:
 * - Exact Matches (score >= 90)
 * - Partial Matches (70-89)
 * - Similar Matches (50-69)
 *
 * Includes optional category filtering via CategoryFilter component.
 * Sections are collapsible with expandable headers.
 */

import { useState, useMemo } from 'react';
import type { SearchResponse, SearchResult, CategoryId } from '@/types';
import { ResultCard } from './ResultCard';
import { CategoryFilter } from './CategoryFilter';
import { theme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface SearchResultsProps {
  /** Complete search response */
  response: SearchResponse;

  /** Callback when a result is added to cart */
  onAddToCart: (result: SearchResult) => void;

  /** Callback when a suggestion is clicked */
  onSuggestionClick: (suggestion: string) => void;

  /** Show category filter (default: true) */
  showCategoryFilter?: boolean;
}

interface ResultSectionProps {
  /** Section title */
  title: string;

  /** Results to display */
  results: readonly SearchResult[];

  /** Whether section is expanded */
  isExpanded: boolean;

  /** Toggle expansion */
  onToggle: () => void;

  /** Callback when a result is added to cart */
  onAddToCart: (result: SearchResult) => void;

  /** Accent color for the header */
  accentColor: string;
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

// =============================================================================
// RESULT SECTION
// =============================================================================

function ResultSection({
  title,
  results,
  isExpanded,
  onToggle,
  onAddToCart,
  accentColor,
}: ResultSectionProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Section header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: theme.colors.bgAlt,
          border: 'none',
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: theme.borderRadius.sm,
          cursor: 'pointer',
          marginBottom: isExpanded ? '0.75rem' : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontWeight: 600,
              color: theme.colors.textPrimary,
              fontSize: theme.typography.fontSizes.md,
            }}
          >
            {title}
          </span>
          <span
            style={{
              backgroundColor: accentColor,
              color: '#fff',
              padding: '0.125rem 0.5rem',
              borderRadius: theme.borderRadius.full,
              fontSize: theme.typography.fontSizes.xs,
              fontWeight: 600,
            }}
          >
            {results.length}
          </span>
        </div>
        <span
          style={{
            color: theme.colors.textMuted,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▼
        </span>
      </button>

      {/* Results list */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {results.map((result, index) => (
            <ResultCard
              key={index}
              result={result}
              onAddToCart={() => onAddToCart(result)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SearchResults({
  response,
  onAddToCart,
  onSuggestionClick,
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

  // Group filtered results by quality tier
  const exactMatches = filteredResults.filter((r) => r.score >= 90);
  const partialMatches = filteredResults.filter((r) => r.score >= 70 && r.score < 90);
  const similarMatches = filteredResults.filter((r) => r.score >= 50 && r.score < 70);

  const hasExactOrPartial = exactMatches.length > 0 || partialMatches.length > 0;

  // Expansion state - similar collapsed by default if better matches exist
  const [exactExpanded, setExactExpanded] = useState(true);
  const [partialExpanded, setPartialExpanded] = useState(true);
  const [similarExpanded, setSimilarExpanded] = useState(!hasExactOrPartial);

  // No results at all
  if (response.results.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          color: theme.colors.textMuted,
        }}
      >
        <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No matches found</p>
        <p>Try a different model number or manufacturer</p>

        {response.suggestions.length > 0 && (
          <p style={{ marginTop: '1rem' }}>
            Did you mean:{' '}
            {response.suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(suggestion)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.primary,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginLeft: '0.5rem',
                }}
              >
                {suggestion}
              </button>
            ))}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Category Filter */}
      {showCategoryFilter && (
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          resultCounts={categoryCounts}
        />
      )}

      {/* Results metadata */}
      <p
        style={{
          color: theme.colors.textMuted,
          marginBottom: '1rem',
          fontSize: theme.typography.fontSizes.sm,
        }}
      >
        {filteredResults.length} results
        {activeCategory !== 'all' && ` (filtered from ${response.results.length})`}
        {' '}• {response.confidence} confidence • {response.durationMs.toFixed(1)}ms
      </p>

      {/* No results after filtering */}
      {filteredResults.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: theme.colors.textMuted,
          }}
        >
          <p>No results in this category</p>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              marginTop: '0.5rem',
              background: 'none',
              border: 'none',
              color: theme.colors.primary,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Show all results
          </button>
        </div>
      )}

      {/* Grouped sections */}
      <ResultSection
        title="Exact Matches"
        results={exactMatches}
        isExpanded={exactExpanded}
        onToggle={() => setExactExpanded(!exactExpanded)}
        onAddToCart={onAddToCart}
        accentColor={theme.colors.success}
      />

      <ResultSection
        title="Partial Matches"
        results={partialMatches}
        isExpanded={partialExpanded}
        onToggle={() => setPartialExpanded(!partialExpanded)}
        onAddToCart={onAddToCart}
        accentColor={theme.colors.warning}
      />

      <ResultSection
        title="Similar Matches"
        results={similarMatches}
        isExpanded={similarExpanded}
        onToggle={() => setSimilarExpanded(!similarExpanded)}
        onAddToCart={onAddToCart}
        accentColor={theme.colors.textMuted}
      />
    </div>
  );
}
