/**
 * Cart Component
 *
 * Displays the BOM (Bill of Materials) cart with:
 * - Header with title and item count
 * - List of CartItemRow components
 * - Summary footer with totals
 * - Clear cart action
 *
 * Migrated to Fluent UI components.
 */

import {
  Card,
  Button,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Cart24Regular, Delete24Regular, DocumentPdf24Regular } from '@fluentui/react-icons';
import type { CartItem, CartSummary } from '@/types';
import { CartItemRow } from './CartItemRow';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
  },
  itemCountBadge: {
    backgroundColor: axisTokens.primary,
    color: '#000',
    padding: '0.25rem 0.75rem',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  itemList: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
  },
  itemListContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '200px',
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  emptyIcon: {
    marginBottom: '1rem',
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: '0.5rem',
  },
  footer: {
    padding: '1rem',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '1rem',
  },
  summaryLabel: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  unknownPriceWarning: {
    color: axisTokens.warning,
    fontSize: tokens.fontSizeBase100,
    marginTop: '0.25rem',
  },
  totalAmount: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
  },
  footerButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  exportButton: {
    flex: 1,
  },
  clearButton: {
    flex: 1,
  },
});

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

  /** Callback when Export PDF is clicked */
  onExportPDF?: () => void;

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
  onExportPDF,
  title = 'BOM Cart',
}: CartProps) {
  const styles = useStyles();
  const isEmpty = items.length === 0;
  const itemCountLabel = summary.uniqueModels === 1 ? '1 item' : `${summary.uniqueModels} items`;

  return (
    <Card className={styles.container} appearance="outline">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Cart24Regular style={{ color: axisTokens.primary }} />
          <Text className={styles.headerTitle}>{title}</Text>
        </div>
        <span className={styles.itemCountBadge}>{itemCountLabel}</span>
      </div>

      {/* Item List */}
      <div className={styles.itemList}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <Cart24Regular
              style={{ width: 48, height: 48 }}
              className={styles.emptyIcon}
            />
            <Text size={400} className={styles.emptyTitle}>
              Your BOM is empty
            </Text>
            <Text size={200}>
              Search for cameras and add them to your BOM
            </Text>
          </div>
        ) : (
          <div className={styles.itemListContent}>
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
      <div className={styles.footer}>
        {/* Summary */}
        <div className={styles.summaryRow}>
          <div>
            <Text className={styles.summaryLabel}>Total MSRP</Text>
            {summary.unknownPriceCount > 0 && (
              <Text className={styles.unknownPriceWarning} block>
                {summary.unknownPriceCount} item{summary.unknownPriceCount !== 1 ? 's' : ''} with
                price TBD
              </Text>
            )}
          </div>
          <Text className={styles.totalAmount}>{summary.formattedTotal}</Text>
        </div>

        {/* Action Buttons */}
        <div className={styles.footerButtons}>
          {onExportPDF && (
            <Button
              onClick={onExportPDF}
              disabled={isEmpty}
              aria-label="Export PDF"
              appearance="primary"
              className={styles.exportButton}
              icon={<DocumentPdf24Regular />}
              style={{
                backgroundColor: isEmpty ? undefined : axisTokens.primary,
                color: isEmpty ? undefined : '#000',
              }}
            >
              Export PDF
            </Button>
          )}
          <Button
            onClick={onClear}
            disabled={isEmpty}
            aria-label="Clear BOM"
            appearance="outline"
            className={styles.clearButton}
            icon={<Delete24Regular />}
            style={{
              borderColor: isEmpty ? undefined : axisTokens.error,
              color: isEmpty ? undefined : axisTokens.error,
            }}
          >
            Clear BOM
          </Button>
        </div>
      </div>
    </Card>
  );
}
