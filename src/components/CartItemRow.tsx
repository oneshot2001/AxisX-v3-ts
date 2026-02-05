/**
 * CartItemRow Component
 *
 * Displays a single cart item with quantity controls, line total, and remove button.
 */

import type { CartItem } from '@/types';
import { getFormattedPrice } from '@/core/msrp';
import { theme } from '../theme';

// =============================================================================
// TYPES
// =============================================================================

export interface CartItemRowProps {
  /** The cart item to display */
  item: CartItem;

  /** Callback when quantity changes */
  onQuantityChange: (quantity: number) => void;

  /** Callback when item is removed */
  onRemove: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format line total (msrp × quantity) or "TBD"
 */
function formatLineTotal(msrp: number | null, quantity: number): string {
  if (msrp === null) {
    return 'TBD';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(msrp * quantity);
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const unitPrice = getFormattedPrice(item.model);
  const lineTotal = formatLineTotal(item.msrp, item.quantity);

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.bgCard,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      {/* Model info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: theme.colors.textPrimary }}>
          {item.model}
        </div>
        {item.competitorModel && (
          <div
            style={{
              fontSize: theme.typography.fontSizes.sm,
              color: theme.colors.textMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Replaces: {item.competitorModel}
            {item.competitorManufacturer && ` (${item.competitorManufacturer})`}
          </div>
        )}
        <div
          style={{
            fontSize: theme.typography.fontSizes.xs,
            color: theme.colors.textMuted,
            marginTop: '0.25rem',
          }}
        >
          {unitPrice} each
        </div>
      </div>

      {/* Quantity controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: theme.colors.bgAlt,
          borderRadius: theme.borderRadius.sm,
          padding: '0.25rem',
        }}
      >
        <button
          onClick={() => onQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
          style={{
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            backgroundColor: item.quantity <= 1 ? 'transparent' : theme.colors.bgCard,
            color: item.quantity <= 1 ? theme.colors.textMuted : theme.colors.textPrimary,
            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: theme.typography.fontSizes.md,
          }}
        >
          −
        </button>
        <span
          style={{
            minWidth: '2rem',
            textAlign: 'center',
            fontWeight: 600,
            color: theme.colors.textPrimary,
          }}
        >
          {item.quantity}
        </span>
        <button
          onClick={() => onQuantityChange(item.quantity + 1)}
          aria-label="Increase quantity"
          style={{
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.bgCard,
            color: theme.colors.textPrimary,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: theme.typography.fontSizes.md,
          }}
        >
          +
        </button>
      </div>

      {/* Line total */}
      <div
        style={{
          minWidth: '5rem',
          textAlign: 'right',
          fontWeight: 600,
          color: item.msrp !== null ? theme.colors.textPrimary : theme.colors.textMuted,
          fontSize: theme.typography.fontSizes.md,
        }}
      >
        {lineTotal}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        aria-label="Remove item"
        style={{
          width: '2rem',
          height: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: theme.colors.error,
          fontSize: theme.typography.fontSizes.lg,
        }}
      >
        ✕
      </button>
    </div>
  );
}
