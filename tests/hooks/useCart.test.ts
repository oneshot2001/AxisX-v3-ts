/**
 * useCart Hook Tests - localStorage Persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';

describe('useCart localStorage persistence', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get store() {
        return store;
      },
    };
  })();

  beforeEach(() => {
    // Clear mock storage and reset calls
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('initializes with empty array when localStorage is empty', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('axisx-cart');
    });

    it('loads items from localStorage on initialization', () => {
      const storedItems = [
        {
          id: 'stored-1',
          model: 'P3265-LVE',
          msrp: 1299,
          quantity: 2,
          source: 'search',
          axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
        },
      ];
      localStorageMock.setItem('axisx-cart', JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual(storedItems);
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('axisx-cart', 'not-valid-json');

      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual([]);
    });
  });

  describe('Persistence', () => {
    it('saves items to localStorage when items change', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem('P3265-LVE');
      });

      // Check localStorage was called with the new item
      const savedData = JSON.parse(localStorageMock.store['axisx-cart']);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].model).toBe('P3265-LVE');
    });

    it('updates localStorage when item is removed', () => {
      const storedItems = [
        {
          id: 'stored-1',
          model: 'P3265-LVE',
          msrp: 1299,
          quantity: 2,
          source: 'search',
          axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
        },
      ];
      localStorageMock.setItem('axisx-cart', JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.removeItem('stored-1');
      });

      const savedData = JSON.parse(localStorageMock.store['axisx-cart']);
      expect(savedData).toHaveLength(0);
    });

    it('updates localStorage when quantity changes', () => {
      const storedItems = [
        {
          id: 'stored-1',
          model: 'P3265-LVE',
          msrp: 1299,
          quantity: 2,
          source: 'search',
          axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
        },
      ];
      localStorageMock.setItem('axisx-cart', JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.updateQuantity('stored-1', 5);
      });

      const savedData = JSON.parse(localStorageMock.store['axisx-cart']);
      expect(savedData[0].quantity).toBe(5);
    });

    it('clears localStorage when cart is cleared', () => {
      const storedItems = [
        {
          id: 'stored-1',
          model: 'P3265-LVE',
          msrp: 1299,
          quantity: 2,
          source: 'search',
          axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
        },
      ];
      localStorageMock.setItem('axisx-cart', JSON.stringify(storedItems));

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.clear();
      });

      const savedData = JSON.parse(localStorageMock.store['axisx-cart']);
      expect(savedData).toHaveLength(0);
    });
  });
});
