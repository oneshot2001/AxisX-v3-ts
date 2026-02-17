import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBatchSearch } from '@/hooks/useBatchSearch';
import type { ISearchEngine, SearchResponse } from '@/types';

function makeSearchResponse(query: string): SearchResponse {
  const result = {
    score: 100,
    type: 'exact' as const,
    mapping: {
      competitor_model: query,
      competitor_manufacturer: 'Hikvision',
      axis_replacement: 'P3265-LVE',
      match_confidence: 95,
    },
    isLegacy: false,
    axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
    category: 'ndaa' as const,
  };

  return {
    query,
    queryType: 'competitor',
    results: [result],
    grouped: {
      exact: [result],
      partial: [],
      similar: [],
    },
    suggestions: [],
    confidence: 'high',
    durationMs: 1,
    isBatch: false,
  };
}

const engine: ISearchEngine = {
  search: (query: string) => makeSearchResponse(query),
  searchCompetitor: () => [],
  searchLegacy: () => [],
  lookupAxisModel: () => null,
  getManufacturerModels: () => [],
  searchBatch: () => new Map(),
  getSuggestions: () => [],
  configure: () => {},
};

describe('useBatchSearch', () => {
  it('preserves imported quantities and rawInput', () => {
    const { result } = renderHook(() => useBatchSearch(engine));

    act(() => {
      result.current.setImportedItems([
        { input: 'DS-2CD2143G2-I', quantity: 3 },
        { input: 'CD62', quantity: 5 },
      ]);
    });

    expect(result.current.rawInput).toBe('DS-2CD2143G2-I\nCD62');
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]?.quantity).toBe(3);
    expect(result.current.items[1]?.quantity).toBe(5);
  });

  it('keeps imported quantity through batch processing', async () => {
    const { result } = renderHook(() => useBatchSearch(engine, { searchDelayMs: 0 }));

    act(() => {
      result.current.setImportedItems([{ input: 'DS-2CD2143G2-I', quantity: 4 }]);
    });

    await act(async () => {
      await result.current.processBatch();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.status).toBe('complete');
    expect(result.current.items[0]?.quantity).toBe(4);
    expect(result.current.items[0]?.selected).toBe(true);
  });
});

