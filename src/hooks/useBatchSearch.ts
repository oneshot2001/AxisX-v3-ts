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
} from '@/types';
import { generateId as genId } from '@/types';

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
 * Parse raw input text into individual search queries.
 * Splits by newlines, filters empty lines, trims whitespace.
 */
function parseRawInput(input: string): string[] {
  return input
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

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
    const queries = parseRawInput(input);
    setItems(queries.map(createBatchItem));
    setProgress({ current: 0, total: queries.length, percent: 0 });
  }, []);

  // Process all items in batch
  const processBatch = useCallback(async () => {
    if (items.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;

      const itemId = item.id;
      const itemInput = item.input;

      // Update status to searching
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, status: 'searching' as const } : it
        )
      );

      try {
        // Perform search
        const response = engine.search(itemInput);

        // Update with results
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  response,
                  status: 'complete' as const,
                  // Auto-deselect if no results found
                  selected: response.results.length > 0,
                }
              : it
          )
        );
      } catch (error) {
        // Handle error
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  selected: false,
                }
              : it
          )
        );
      }

      // Update progress
      setProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
      });

      // Add delay between searches
      if (i < items.length - 1 && searchDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, searchDelayMs));
      }
    }

    setIsProcessing(false);

    // Call onComplete callback if provided
    if (onComplete) {
      // Get current items state for callback
      setItems((currentItems) => {
        onComplete(currentItems);
        return currentItems;
      });
    }
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
