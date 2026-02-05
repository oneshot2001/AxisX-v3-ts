/**
 * Cart Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cart } from '@/components/Cart';
import type { CartItem, CartSummary } from '@/types';

describe('Cart', () => {
  const mockItem1: CartItem = {
    id: 'test-1',
    model: 'P3265-LVE',
    msrp: 1299,
    quantity: 2,
    source: 'search',
    competitorModel: 'DS-2CD2143G2-I',
    competitorManufacturer: 'Hikvision',
    axisUrl: 'https://www.axis.com/products/axis-p3265-lve',
  };

  const mockItem2: CartItem = {
    id: 'test-2',
    model: 'Q3538-LVE',
    msrp: 2499,
    quantity: 1,
    source: 'direct',
    axisUrl: 'https://www.axis.com/products/axis-q3538-lve',
  };

  const mockItemUnknownPrice: CartItem = {
    id: 'test-3',
    model: 'CUSTOM-MODEL',
    msrp: null,
    quantity: 1,
    source: 'direct',
    axisUrl: 'https://www.axis.com/products?q=CUSTOM-MODEL',
  };

  const mockSummary: CartSummary = {
    uniqueModels: 2,
    totalQuantity: 3,
    totalMSRP: 5097,
    unknownPriceCount: 0,
    formattedTotal: '$5,097',
  };

  const mockSummaryWithUnknown: CartSummary = {
    uniqueModels: 3,
    totalQuantity: 4,
    totalMSRP: 5097,
    unknownPriceCount: 1,
    formattedTotal: '$5,097',
  };

  const onUpdateQuantity = vi.fn();
  const onRemoveItem = vi.fn();
  const onClear = vi.fn();

  beforeEach(() => {
    onUpdateQuantity.mockClear();
    onRemoveItem.mockClear();
    onClear.mockClear();
  });

  describe('Basic rendering', () => {
    it('renders cart title and item count', () => {
      render(
        <Cart
          items={[mockItem1, mockItem2]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      expect(screen.getByText('BOM Cart')).toBeInTheDocument();
      expect(screen.getByText('2 items')).toBeInTheDocument();
    });

    it('renders singular "item" for single item', () => {
      const singleSummary: CartSummary = {
        ...mockSummary,
        uniqueModels: 1,
        totalQuantity: 1,
      };

      render(
        <Cart
          items={[mockItem1]}
          summary={singleSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    it('renders custom title when provided', () => {
      render(
        <Cart
          items={[mockItem1]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
          title="My Quote"
        />
      );

      expect(screen.getByText('My Quote')).toBeInTheDocument();
    });

    it('renders all cart items', () => {
      render(
        <Cart
          items={[mockItem1, mockItem2]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      expect(screen.getByText('P3265-LVE')).toBeInTheDocument();
      expect(screen.getByText('Q3538-LVE')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('displays empty state when no items', () => {
      const emptySummary: CartSummary = {
        uniqueModels: 0,
        totalQuantity: 0,
        totalMSRP: 0,
        unknownPriceCount: 0,
        formattedTotal: '$0',
      };

      render(
        <Cart
          items={[]}
          summary={emptySummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      expect(screen.getByText(/bom is empty/i)).toBeInTheDocument();
    });

    it('disables Clear BOM button when empty', () => {
      const emptySummary: CartSummary = {
        uniqueModels: 0,
        totalQuantity: 0,
        totalMSRP: 0,
        unknownPriceCount: 0,
        formattedTotal: '$0',
      };

      render(
        <Cart
          items={[]}
          summary={emptySummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      const clearButton = screen.getByRole('button', { name: /clear bom/i });
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Summary footer', () => {
    it('shows formatted total MSRP', () => {
      render(
        <Cart
          items={[mockItem1, mockItem2]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      expect(screen.getByText('$5,097')).toBeInTheDocument();
    });

    it('shows unknown price indicator when items have null MSRP', () => {
      render(
        <Cart
          items={[mockItem1, mockItem2, mockItemUnknownPrice]}
          summary={mockSummaryWithUnknown}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      expect(screen.getByText(/1 item.*price TBD/i)).toBeInTheDocument();
    });

    it('hides unknown price indicator when all prices known', () => {
      render(
        <Cart
          items={[mockItem1, mockItem2]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      expect(screen.queryByText(/price TBD/i)).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('calls onClear when Clear BOM button clicked', () => {
      render(
        <Cart
          items={[mockItem1]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /clear bom/i }));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('passes onUpdateQuantity to CartItemRow', () => {
      render(
        <Cart
          items={[mockItem1]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      // Click the + button to increase quantity
      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
      expect(onUpdateQuantity).toHaveBeenCalledWith('test-1', 3);
    });

    it('passes onRemoveItem to CartItemRow', () => {
      render(
        <Cart
          items={[mockItem1]}
          summary={mockSummary}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          onClear={onClear}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove item/i }));
      expect(onRemoveItem).toHaveBeenCalledWith('test-1');
    });
  });
});
