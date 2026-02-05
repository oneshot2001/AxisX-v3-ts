/**
 * Cart Component
 *
 * Displays the BOM (Bill of Materials) cart with:
 * - Header with title and item count
 * - List of CartItemRow components
 * - Summary footer with totals
 * - Clear cart action
 */

import { ShoppingCart, Trash2 } from 'lucide-react';
import type { CartItem, CartSummary } from '@/types';
import { CartItemRow } from './CartItemRow';
import { theme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface CartProps {
  /** Cart items */
  items: CartItem[];

  /** Cart summary (totals, counts) */
  summary: CartSummary;

  /** Callback when item quantity changes */
  onUpdateQuantity: (id: string, quantity: number) => void;

  /** Callback when item is removed */
  onRemoveItem: (id: string) => void;

  /** Callback when cart is cleared */
  onClear: () => void;

  /** Optional title override (default: "BOM Cart") */
  title?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Cart({
  items,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  title = 'BOM Cart',
}: CartProps) {
  const isEmpty = items.length === 0;
  const itemCountLabel = summary.uniqueModels === 1 ? '1 item' : `${summary.uniqueModels} items`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.colors.bgMain,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.bgCard,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={20} color={theme.colors.primary} />
          <span
            style={{
              fontWeight: 600,
              fontSize: theme.typography.fontSizes.lg,
              color: theme.colors.textPrimary,
            }}
          >
            {title}
          </span>
        </div>
        <span
          style={{
            backgroundColor: theme.colors.primary,
            color: '#fff',
            padding: '0.25rem 0.75rem',
            borderRadius: theme.borderRadius.full,
            fontSize: theme.typography.fontSizes.sm,
            fontWeight: 600,
          }}
        >
          {itemCountLabel}
        </span>
      </div>

      {/* Item List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        {isEmpty ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '200px',
              color: theme.colors.textMuted,
              textAlign: 'center',
            }}
          >
            <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: theme.typography.fontSizes.md, marginBottom: '0.5rem' }}>
              Your cart is empty
            </p>
            <p style={{ fontSize: theme.typography.fontSizes.sm }}>
              Search for cameras and add them to your BOM
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onQuantityChange={(quantity) => onUpdateQuantity(item.id, quantity)}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '1rem',
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.bgAlt,
        }}
      >
        {/* Summary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: theme.typography.fontSizes.sm,
                color: theme.colors.textMuted,
              }}
            >
              Total MSRP
            </span>
            {summary.unknownPriceCount > 0 && (
              <div
                style={{
                  fontSize: theme.typography.fontSizes.xs,
                  color: theme.colors.warning,
                  marginTop: '0.25rem',
                }}
              >
                {summary.unknownPriceCount} item{summary.unknownPriceCount !== 1 ? 's' : ''} with
                price TBD
              </div>
            )}
          </div>
          <span
            style={{
              fontSize: theme.typography.fontSizes.xl,
              fontWeight: 700,
              color: theme.colors.textPrimary,
            }}
          >
            {summary.formattedTotal}
          </span>
        </div>

        {/* Clear Cart Button */}
        <button
          onClick={onClear}
          disabled={isEmpty}
          aria-label="Clear Cart"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            border: `1px solid ${isEmpty ? theme.colors.border : theme.colors.error}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: 'transparent',
            color: isEmpty ? theme.colors.textMuted : theme.colors.error,
            cursor: isEmpty ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: theme.typography.fontSizes.sm,
            transition: 'background-color 0.2s ease',
          }}
        >
          <Trash2 size={16} />
          Clear Cart
        </button>
      </div>
    </div>
  );
}
