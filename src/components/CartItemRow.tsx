/**
 * CartItemRow Component
 *
 * Displays a single cart item with quantity controls, line total, and remove button.
 * Migrated to Fluent UI components.
 */

import {
  Card,
  Button,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Dismiss24Regular, Add24Regular, Subtract24Regular } from '@fluentui/react-icons';
import type { CartItem } from '@/types';
import { getFormattedPrice } from '@/core/msrp';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
  },
  modelInfo: {
    flex: 1,
    minWidth: 0,
  },
  modelName: {
    fontWeight: tokens.fontWeightSemibold,
  },
  replacesText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  unitPrice: {
    marginTop: '0.25rem',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    padding: '0.25rem',
  },
  quantityButton: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
  },
  quantityText: {
    minWidth: '2rem',
    textAlign: 'center',
    fontWeight: tokens.fontWeightSemibold,
  },
  lineTotal: {
    minWidth: '5rem',
    textAlign: 'right',
    fontWeight: tokens.fontWeightSemibold,
  },
  removeButton: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
  },
});

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
 * Format line total (msrp x quantity) or "TBD"
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
  const styles = useStyles();
  const unitPrice = getFormattedPrice(item.model);
  const lineTotal = formatLineTotal(item.msrp, item.quantity);

  return (
    <Card className={styles.card} appearance="outline">
      {/* Model info */}
      <div className={styles.modelInfo}>
        <Text className={styles.modelName} block>
          {item.model}
        </Text>
        {item.competitorModel && (
          <Text size={200} className={styles.replacesText} block>
            Replaces: {item.competitorModel}
            {item.competitorManufacturer && ` (${item.competitorManufacturer})`}
          </Text>
        )}
        <Text size={100} className={styles.unitPrice} block>
          {unitPrice} each
        </Text>
      </div>

      {/* Quantity controls */}
      <div className={styles.quantityControls}>
        <Button
          onClick={() => onQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
          appearance="subtle"
          size="small"
          icon={<Subtract24Regular />}
          className={styles.quantityButton}
        />
        <Text className={styles.quantityText}>
          {item.quantity}
        </Text>
        <Button
          onClick={() => onQuantityChange(item.quantity + 1)}
          aria-label="Increase quantity"
          appearance="subtle"
          size="small"
          icon={<Add24Regular />}
          className={styles.quantityButton}
        />
      </div>

      {/* Line total */}
      <Text
        className={styles.lineTotal}
        style={{ color: item.msrp !== null ? undefined : tokens.colorNeutralForeground3 }}
      >
        {lineTotal}
      </Text>

      {/* Remove button */}
      <Button
        onClick={onRemove}
        aria-label="Remove item"
        appearance="subtle"
        size="small"
        icon={<Dismiss24Regular />}
        className={styles.removeButton}
        style={{ color: tokens.colorPaletteRedForeground1 }}
      />
    </Card>
  );
}
