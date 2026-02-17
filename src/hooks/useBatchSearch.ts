/**
 * useBatchSearch Hook
 *
 * Manages batch search state for multi-model input.
 * Enables processing multiple competitor models at once with progress tracking.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  ISearchEngine,
  BatchSearchItem,
  BatchProgress,
  SearchResponse,
} from '@/types';
import { generateId as genId } from '@/types';
import { parseBatchInput, validateBatch, MAX_BATCH_SIZE } from '@/core/search/queryParser';

// =============================================================================
// TYPES
// =============================================================================

export interface UseBatchSearchOptions {
  /** Delay between searches to prevent overwhelming the engine (ms) */
  readonly searchDelayMs?: number;
  /** Callback when batch processing completes */
  readonly onComplete?: (items: readonly BatchSearchItem[]) => void;
}

export interface UseBatchSearchReturn {
  /** Raw input text (multi-line) */
  readonly rawInput: string;

  /** Set raw input text */
  readonly setRawInput: (input: string) => void;

  /** Set parsed batch items directly (preserves quantities from imports) */
  readonly setImportedItems: (items: readonly { input: string; quantity: number }[]) => void;

  /** Parsed batch items */
  readonly items: readonly BatchSearchItem[];

  /** Is currently processing batch */
  readonly isProcessing: boolean;

  /** Current progress */
  readonly progress: BatchProgress;

  /** Process all items in batch */
  readonly processBatch: () => Promise<void>;

  /** Toggle selection for an item */
  readonly toggleSelection: (id: string) => void;

  /** Select all items */
  readonly selectAll: () => void;

  /** Deselect all items */
  readonly deselectAll: () => void;

  /** Update quantity for an item */
  readonly updateQuantity: (id: string, quantity: number) => void;

  /** Get selected items */
  readonly selectedItems: readonly BatchSearchItem[];

  /** Number of models parsed from input */
  readonly modelCount: number;

  /** Number of selected items */
  readonly selectedCount: number;

  /** Clear all items and reset state */
  readonly clear: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Create a batch item from a raw query string.
 */
function createBatchItem(input: string): BatchSearchItem {
  return {
    id: genId(),
    input,
    response: null,
    selected: true,
    quantity: 1,
    status: 'pending',
  };
}

/**
 * Create a batch item from imported row data.
 */
function createImportedBatchItem(input: string, quantity: number): BatchSearchItem {
  return {
    id: genId(),
    input,
    response: null,
    selected: true,
    quantity: Math.max(1, Math.floor(quantity)),
    status: 'pending',
  };
}

// =============================================================================
// HOOK
// =============================================================================

export function useBatchSearch(
  engine: ISearchEngine,
  options: UseBatchSearchOptions = {}
): UseBatchSearchReturn {
  const { searchDelayMs = 50, onComplete } = options;

  // State
  const [rawInput, setRawInput] = useState('');
  const [items, setItems] = useState<BatchSearchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress>({
    current: 0,
    total: 0,
    percent: 0,
  });

  // Parse raw input into items when input changes
  const handleSetRawInput = useCallback((input: string) => {
    setRawInput(input);
    const queries = parseBatchInput(input);
    const limitedQueries = queries.slice(0, MAX_BATCH_SIZE);
    const validation = validateBatch(limitedQueries);
    const validQueries = validation.valid ? limitedQueries : [];
    setItems(validQueries.map(createBatchItem));
    setProgress({ current: 0, total: validQueries.length, percent: 0 });
  }, []);

  const setImportedItems = useCallback((importedItems: readonly { input: string; quantity: number }[]) => {
    const normalized = importedItems
      .map((item) => ({
        input: item.input.trim(),
        quantity: Math.max(1, Math.floor(item.quantity)),
      }))
      .filter((item) => item.input.length > 0);

    setRawInput(normalized.map((item) => item.input).join('\n'));
    setItems(normalized.map((item) => createImportedBatchItem(item.input, item.quantity)));
    setProgress({ current: 0, total: normalized.length, percent: 0 });
  }, []);

  // Process all items in batch
  const processBatch = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const total = items.length;
    const workingItems = items.map((item) => ({ ...item }));
    const flushInterval = 10;
    const responseCache = new Map<string, SearchResponse>();

    const flushState = (current: number) => {
      setItems([...workingItems]);
      setProgress({
        current,
        total,
        percent: Math.round((current / total) * 100),
      });
    };

    for (let i = 0; i < total; i++) {
      const item = workingItems[i];
      if (!item) continue;

      const searchingItem: BatchSearchItem = {
        ...item,
        status: 'searching',
        error: undefined,
      };
      workingItems[i] = searchingItem;

      try {
        const cacheKey = item.input.trim().toLowerCase();
        const cachedResponse = responseCache.get(cacheKey);
        const response = cachedResponse ?? engine.search(item.input);
        if (!cachedResponse) {
          responseCache.set(cacheKey, response);
        }
        workingItems[i] = {
          ...searchingItem,
          response,
          status: 'complete',
          selected: response.results.length > 0,
        };
      } catch (error) {
        workingItems[i] = {
          ...searchingItem,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          selected: false,
        };
      }

      const current = i + 1;
      const shouldFlush = current % flushInterval === 0 || current === total;
      if (shouldFlush) {
        flushState(current);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      if (i < total - 1 && searchDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, searchDelayMs));
      }
    }

    setIsProcessing(false);
    onComplete?.(workingItems);
  }, [items, isProcessing, engine, searchDelayMs, onComplete]);

  // Toggle selection for an item
  const toggleSelection = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  // Select all items
  const selectAll = useCallback(() => {
    setItems((prev) =>
      prev.map((item) =>
        item.status === 'complete' && item.response && item.response.results.length > 0
          ? { ...item, selected: true }
          : item
      )
    );
  }, []);

  // Deselect all items
  const deselectAll = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  }, []);

  // Update quantity for an item
  const updateQuantity = useCallback((id: string, quantity: number) => {
    const validQty = Math.max(1, Math.floor(quantity));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: validQty } : item
      )
    );
  }, []);

  // Get selected items (with results)
  const selectedItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.selected &&
          item.status === 'complete' &&
          item.response &&
          item.response.results.length > 0
      ),
    [items]
  );

  // Count of models parsed from input
  const modelCount = items.length;

  // Count of selected items
  const selectedCount = selectedItems.length;

  // Clear all
  const clear = useCallback(() => {
    setRawInput('');
    setItems([]);
    setProgress({ current: 0, total: 0, percent: 0 });
    setIsProcessing(false);
  }, []);

  return {
    rawInput,
    setRawInput: handleSetRawInput,
    setImportedItems,
    items,
    isProcessing,
    progress,
    processBatch,
    toggleSelection,
    selectAll,
    deselectAll,
    updateQuantity,
    selectedItems,
    modelCount,
    selectedCount,
    clear,
  };
}
