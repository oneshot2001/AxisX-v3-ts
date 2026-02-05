/**
 * useCart Hook
 * 
 * Manages the BOM (Bill of Materials) cart.
 * Handles add, remove, update, and calculations.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { CartItem, CartSummary, SearchResult, CompetitorMapping } from '@/types';
import { generateId } from '@/types';
import { getMSRP } from '@/core/msrp';
import { getAxisURL } from '@/core/url';

// =============================================================================
// TYPES
// =============================================================================

export interface UseCartReturn {
  /** Cart items */
  items: CartItem[];
  
  /** Cart summary (totals, counts) */
  summary: CartSummary;
  
  /** Add item to cart */
  addItem: (model: string, options?: AddItemOptions) => void;
  
  /** Add from search result with optional quantity */
  addFromResult: (result: SearchResult, quantity?: number) => void;
  
  /** Remove item by ID */
  removeItem: (id: string) => void;
  
  /** Update item quantity */
  updateQuantity: (id: string, quantity: number) => void;
  
  /** Update item notes */
  updateNotes: (id: string, notes: string) => void;
  
  /** Clear all items */
  clear: () => void;
  
  /** Check if model is in cart */
  hasItem: (model: string) => boolean;
  
  /** Get item count for model */
  getQuantity: (model: string) => number;
}

export interface AddItemOptions {
  quantity?: number;
  source?: CartItem['source'];
  competitorModel?: string;
  competitorManufacturer?: string;
  notes?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CART_STORAGE_KEY = 'axisx-cart';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Load cart items from localStorage
 */
function loadFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Corrupted data, ignore and return empty array
  }
  return [];
}

/**
 * Save cart items to localStorage
 */
function saveToStorage(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage());

  // Persist to localStorage when items change
  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  // Calculate summary
  const summary = useMemo((): CartSummary => {
    let totalMSRP = 0;
    let unknownPriceCount = 0;
    let totalQuantity = 0;

    for (const item of items) {
      totalQuantity += item.quantity;
      
      if (item.msrp !== null) {
        totalMSRP += item.msrp * item.quantity;
      } else {
        unknownPriceCount += item.quantity;
      }
    }

    return {
      uniqueModels: items.length,
      totalQuantity,
      totalMSRP,
      unknownPriceCount,
      formattedTotal: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(totalMSRP),
    };
  }, [items]);

  // Add item
  const addItem = useCallback((model: string, options: AddItemOptions = {}) => {
    const {
      quantity = 1,
      source = 'direct',
      competitorModel,
      competitorManufacturer,
      notes,
    } = options;

    const normalizedModel = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();

    // Check if already in cart
    const existingIndex = items.findIndex(
      item => item.model.toUpperCase() === normalizedModel
    );

    if (existingIndex >= 0) {
      // Update quantity
      setItems(prev => prev.map((item, i) =>
        i === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
      return;
    }

    // Get MSRP
    let msrp: number | null = null;
    try {
      msrp = getMSRP().getPrice(normalizedModel);
    } catch {
      // MSRP not initialized yet
    }

    // Get URL
    const axisUrl = getAxisURL(normalizedModel);

    // Create new item
    const newItem: CartItem = {
      id: generateId(),
      model: normalizedModel,
      msrp,
      quantity,
      source,
      competitorModel,
      competitorManufacturer,
      axisUrl,
      notes,
    };

    setItems(prev => [...prev, newItem]);
  }, [items]);

  // Add from search result with optional quantity
  const addFromResult = useCallback((result: SearchResult, quantity: number = 1) => {
    const mapping = result.mapping;

    if (result.isLegacy) {
      // Legacy mapping
      const legacy = mapping as any;
      addItem(legacy.replacement_model, {
        quantity,
        source: 'legacy',
        competitorModel: legacy.legacy_model,
        notes: legacy.notes,
      });
    } else {
      // Competitor mapping
      const competitor = mapping as CompetitorMapping;
      addItem(competitor.axis_replacement, {
        quantity,
        source: 'search',
        competitorModel: competitor.competitor_model,
        competitorManufacturer: competitor.competitor_manufacturer,
      });
    }
  }, [addItem]);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  }, [removeItem]);

  // Update notes
  const updateNotes = useCallback((id: string, notes: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, notes } : item
    ));
  }, []);

  // Clear cart
  const clear = useCallback(() => {
    setItems([]);
  }, []);

  // Check if model in cart
  const hasItem = useCallback((model: string) => {
    const normalized = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();
    return items.some(item => item.model.toUpperCase() === normalized);
  }, [items]);

  // Get quantity for model
  const getQuantity = useCallback((model: string) => {
    const normalized = model.toUpperCase().replace(/^AXIS\s*/i, '').trim();
    const item = items.find(i => i.model.toUpperCase() === normalized);
    return item?.quantity ?? 0;
  }, [items]);

  return {
    items,
    summary,
    addItem,
    addFromResult,
    removeItem,
    updateQuantity,
    updateNotes,
    clear,
    hasItem,
    getQuantity,
  };
}
