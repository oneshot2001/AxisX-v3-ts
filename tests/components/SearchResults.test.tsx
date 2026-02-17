import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchResults } from '@/components/SearchResults';
import type { SearchResponse, SearchResult } from '@/types';

function makeResult(model: string, score: number): SearchResult {
  return {
    score,
    type: score >= 90 ? 'exact' : score >= 70 ? 'partial' : 'similar',
    mapping: {
      competitor_model: model,
      competitor_manufacturer: 'Hikvision',
      axis_replacement: 'P3265-LVE',
      match_confidence: score,
    },
    isLegacy: false,
    axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
    category: 'ndaa',
  };
}

function makeResponse(query: string, results: SearchResult[]): SearchResponse {
  return {
    query,
    queryType: 'competitor',
    results,
    grouped: {
      exact: results.filter((r) => r.type === 'exact'),
      partial: results.filter((r) => r.type === 'partial'),
      similar: results.filter((r) => r.type === 'similar'),
    },
    suggestions: [],
    confidence: results.length ? 'high' : 'none',
    durationMs: 1,
    isBatch: false,
  };
}

describe('SearchResults', () => {
  it('resets accordion defaults when result groups change', () => {
    const onAddToCart = vi.fn();
    const onSuggestionClick = vi.fn();

    const initialResponse = makeResponse('DS-2CD2143G2-I', [
      makeResult('DS-2CD2143G2-I', 100),
      makeResult('DS-2CD2143G2', 60),
    ]);

    const { rerender } = render(
      <SearchResults
        response={initialResponse}
        onAddToCart={onAddToCart}
        onSuggestionClick={onSuggestionClick}
      />
    );

    const similarButtonInitial = screen.getByRole('button', { name: /Similar Matches/i });
    expect(similarButtonInitial).toHaveAttribute('aria-expanded', 'false');

    const similarOnlyResponse = makeResponse('DS-2CD21X', [
      makeResult('DS-2CD2183G2-I', 60),
    ]);

    rerender(
      <SearchResults
        response={similarOnlyResponse}
        onAddToCart={onAddToCart}
        onSuggestionClick={onSuggestionClick}
      />
    );

    const similarButtonUpdated = screen.getByRole('button', { name: /Similar Matches/i });
    expect(similarButtonUpdated).toHaveAttribute('aria-expanded', 'true');
  });
});

