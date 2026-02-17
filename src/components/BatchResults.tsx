/**
 * BatchResults Component
 *
 * Displays batch search results in a grid format with selection checkboxes,
 * confidence badges, and quantity controls.
 */

import {
  Card,
  Button,
  Checkbox,
  Text,
  Input,
  makeStyles,
  tokens,
  mergeClasses,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  Warning24Filled,
  ErrorCircle24Regular,
  Search24Regular,
  Add24Regular,
} from '@fluentui/react-icons';
import type { BatchSearchItem, SearchResult, CompetitorMapping } from '@/types';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  selectionActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '0.75rem',
  },
  itemCard: {
    padding: '0.75rem',
  },
  itemCardSelected: {
    border: `2px solid ${axisTokens.primary}`,
  },
  itemCardError: {
    border: `1px solid ${axisTokens.error}`,
    opacity: 0.7,
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  checkbox: {
    flexShrink: 0,
  },
  inputModel: {
    fontWeight: tokens.fontWeightSemibold,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  statusPending: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
  },
  statusSearching: {
    backgroundColor: axisTokens.primary,
    color: '#000',
  },
  statusComplete: {
    backgroundColor: axisTokens.success,
    color: '#fff',
  },
  statusError: {
    backgroundColor: axisTokens.error,
    color: '#fff',
  },
  statusNotFound: {
    backgroundColor: tokens.colorNeutralForeground3,
    color: '#fff',
  },
  resultContent: {
    marginLeft: '1.75rem',
  },
  replacementRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  arrow: {
    color: axisTokens.primary,
    fontWeight: tokens.fontWeightBold,
  },
  axisModel: {
    fontWeight: tokens.fontWeightSemibold,
    color: axisTokens.primary,
  },
  msrp: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginLeft: 'auto',
  },
  quantityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  quantityLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  quantityInput: {
    width: '60px',
  },
  noResults: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
    fontSize: tokens.fontSizeBase200,
  },
  errorText: {
    color: axisTokens.error,
    fontSize: tokens.fontSizeBase200,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  footerStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  statValue: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
});

// =============================================================================
// TYPES
// =============================================================================

export interface BatchResultsProps {
  /** Batch items to display */
  items: readonly BatchSearchItem[];

  /** Callback when selection is toggled */
  onToggleSelection: (id: string) => void;

  /** Callback to select all items */
  onSelectAll: () => void;

  /** Callback to deselect all items */
  onDeselectAll: () => void;

  /** Callback when quantity changes */
  onQuantityChange: (id: string, quantity: number) => void;

  /** Callback to add selected items to cart */
  onAddSelectedToCart: () => void;

  /** Number of selected items */
  selectedCount: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function getStatusBadge(item: BatchSearchItem, styles: ReturnType<typeof useStyles>) {
  switch (item.status) {
    case 'pending':
      return (
        <span className={mergeClasses(styles.statusBadge, styles.statusPending)}>
          Pending
        </span>
      );
    case 'searching':
      return (
        <span className={mergeClasses(styles.statusBadge, styles.statusSearching)}>
          <Search24Regular style={{ width: 12, height: 12 }} />
          Searching
        </span>
      );
    case 'complete': {
      if (!item.response || item.response.results.length === 0) {
        return (
          <span className={mergeClasses(styles.statusBadge, styles.statusNotFound)}>
            Not Found
          </span>
        );
      }
      const firstResult = item.response.results[0];
      const score = firstResult?.score ?? 0;
      if (score >= 85) {
        return (
          <span className={mergeClasses(styles.statusBadge, styles.statusComplete)}>
            <CheckmarkCircle24Filled style={{ width: 12, height: 12 }} />
            Match
          </span>
        );
      }
      return (
        <span className={mergeClasses(styles.statusBadge, styles.statusSearching)}>
          <Warning24Filled style={{ width: 12, height: 12 }} />
          Partial
        </span>
      );
    }
    case 'error':
      return (
        <span className={mergeClasses(styles.statusBadge, styles.statusError)}>
          <ErrorCircle24Regular style={{ width: 12, height: 12 }} />
          Error
        </span>
      );
  }
}

function getBestResult(item: BatchSearchItem): SearchResult | undefined {
  if (!item.response || item.response.results.length === 0) {
    return undefined;
  }
  return item.response.results[0];
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BatchResults({
  items,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onQuantityChange,
  onAddSelectedToCart,
  selectedCount,
}: BatchResultsProps) {
  const styles = useStyles();

  const completedItems = items.filter((item) => item.status === 'complete');
  const foundItems = completedItems.filter(
    (item) => item.response && item.response.results.length > 0
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Text weight="semibold">Results</Text>
          <Text size={200}>
            {foundItems.length} of {completedItems.length} found
          </Text>
        </div>
        <div className={styles.selectionActions}>
          <Button appearance="subtle" size="small" onClick={onSelectAll}>
            Select All
          </Button>
          <Button appearance="subtle" size="small" onClick={onDeselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className={styles.grid}>
        {items.map((item) => {
          const bestResult = getBestResult(item);
          const canSelect =
            item.status === 'complete' && item.response && item.response.results.length > 0;

          return (
            <Card
              key={item.id}
              className={mergeClasses(
                styles.itemCard,
                item.selected && canSelect ? styles.itemCardSelected : undefined,
                item.status === 'error' ? styles.itemCardError : undefined
              )}
              appearance="outline"
            >
              {/* Item Header */}
              <div className={styles.itemHeader}>
                <Checkbox
                  className={styles.checkbox}
                  checked={item.selected}
                  disabled={!canSelect}
                  onChange={() => onToggleSelection(item.id)}
                />
                <Text className={styles.inputModel}>{item.input}</Text>
                {getStatusBadge(item, styles)}
              </div>

              {/* Result Content */}
              {item.status === 'complete' && (
                <div className={styles.resultContent}>
                  {bestResult ? (
                    <>
                      {/* Replacement Info */}
                      <div className={styles.replacementRow}>
                        <span className={styles.arrow}>{'\u2192'}</span>
                        <Text className={styles.axisModel}>
                          {'axis_replacement' in bestResult.mapping
                            ? (bestResult.mapping as CompetitorMapping).axis_replacement
                            : bestResult.mapping.replacement_model}
                        </Text>
                        {'notes' in bestResult.mapping && bestResult.mapping.notes && (
                          <Text className={styles.msrp}>
                            {bestResult.mapping.notes.slice(0, 30)}
                            {bestResult.mapping.notes.length > 30 ? '...' : ''}
                          </Text>
                        )}
                      </div>

                      {/* Quantity Control */}
                      {canSelect && (
                        <div className={styles.quantityRow}>
                          <Text className={styles.quantityLabel}>Qty:</Text>
                          <Input
                            type="number"
                            min={1}
                            value={String(item.quantity)}
                            onChange={(_e, data) => {
                              const qty = parseInt(data.value, 10);
                              if (!isNaN(qty) && qty > 0) {
                                onQuantityChange(item.id, qty);
                              }
                            }}
                            className={styles.quantityInput}
                            size="small"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <Text className={styles.noResults}>No matching Axis model found</Text>
                  )}
                </div>
              )}

              {/* Error Message */}
              {item.status === 'error' && item.error && (
                <div className={styles.resultContent}>
                  <Text className={styles.errorText}>{item.error}</Text>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerStats}>
          <span>
            Selected: <span className={styles.statValue}>{selectedCount}</span>
          </span>
          <span>
            Total Qty:{' '}
            <span className={styles.statValue}>
              {items
                .filter((item) => item.selected && item.status === 'complete')
                .reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </span>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={onAddSelectedToCart}
          disabled={selectedCount === 0}
        >
          Add Selected to BOM ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
