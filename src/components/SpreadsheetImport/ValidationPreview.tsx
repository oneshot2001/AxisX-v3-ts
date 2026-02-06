/**
 * ValidationPreview Component
 *
 * Shows validation results with status indicators for each row.
 * Allows filtering by status and provides summary stats.
 */

import { useState, useMemo } from 'react';
import {
  Card,
  Text,
  ProgressBar,
  makeStyles,
  tokens,
  mergeClasses,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Warning24Filled,
  Copy24Regular,
} from '@fluentui/react-icons';
import type { SpreadsheetValidationResult, SpreadsheetValidationStatus } from '@/types';
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
  progressSection: {
    padding: '1rem',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  filterBar: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.75rem',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase200,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  filterButtonActive: {
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${axisTokens.primary}`,
  },
  filterCount: {
    fontWeight: tokens.fontWeightSemibold,
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  statusIcon: {
    flexShrink: 0,
  },
  statusFound: {
    color: axisTokens.success,
  },
  statusNotFound: {
    color: tokens.colorNeutralForeground3,
  },
  statusDuplicate: {
    color: axisTokens.cloud,
  },
  statusInvalid: {
    color: axisTokens.error,
  },
  rowNumber: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    minWidth: '40px',
  },
  inputModel: {
    flex: 1,
    fontWeight: tokens.fontWeightSemibold,
    fontFamily: 'monospace',
  },
  replacement: {
    color: axisTokens.primary,
    fontSize: tokens.fontSizeBase200,
  },
  quantity: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    minWidth: '50px',
    textAlign: 'right',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: tokens.colorNeutralForeground3,
  },
});

// =============================================================================
// TYPES
// =============================================================================

export interface ValidationPreviewProps {
  /** Validation results to display */
  results: readonly SpreadsheetValidationResult[];
  /** Whether validation is in progress */
  isProcessing: boolean;
  /** Current progress */
  progress: { current: number; total: number; percent: number };
}

type FilterType = 'all' | SpreadsheetValidationStatus;

// =============================================================================
// HELPERS
// =============================================================================

function getStatusIcon(status: SpreadsheetValidationStatus, styles: ReturnType<typeof useStyles>) {
  switch (status) {
    case 'found':
      return <CheckmarkCircle24Filled className={mergeClasses(styles.statusIcon, styles.statusFound)} />;
    case 'not-found':
      return <DismissCircle24Filled className={mergeClasses(styles.statusIcon, styles.statusNotFound)} />;
    case 'duplicate':
      return <Copy24Regular className={mergeClasses(styles.statusIcon, styles.statusDuplicate)} />;
    case 'invalid':
      return <Warning24Filled className={mergeClasses(styles.statusIcon, styles.statusInvalid)} />;
  }
}

function getReplacementModel(result: SpreadsheetValidationResult): string | null {
  if (result.status !== 'found' || !result.searchResponse?.results.length) {
    return null;
  }
  const firstResult = result.searchResponse.results[0];
  if (!firstResult) return null;

  const mapping = firstResult.mapping;
  if ('axis_replacement' in mapping) {
    return mapping.axis_replacement;
  }
  return mapping.replacement_model;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ValidationPreview({
  results,
  isProcessing,
  progress,
}: ValidationPreviewProps) {
  const styles = useStyles();
  const [filter, setFilter] = useState<FilterType>('all');

  // Count by status
  const counts = useMemo(() => {
    const counts = {
      all: results.length,
      found: 0,
      'not-found': 0,
      duplicate: 0,
      invalid: 0,
    };

    results.forEach((r) => {
      counts[r.status]++;
    });

    return counts;
  }, [results]);

  // Filtered results
  const filteredResults = useMemo(() => {
    if (filter === 'all') return results;
    return results.filter((r) => r.status === filter);
  }, [results, filter]);

  return (
    <div className={styles.container}>
      {/* Progress bar (during processing) */}
      {isProcessing && (
        <div className={styles.progressSection}>
          <div className={styles.progressText}>
            <span>Validating models...</span>
            <span>
              {progress.current} / {progress.total} ({progress.percent}%)
            </span>
          </div>
          <ProgressBar value={progress.percent / 100} />
        </div>
      )}

      {/* Filter bar */}
      {!isProcessing && results.length > 0 && (
        <div className={styles.filterBar}>
          <button
            className={mergeClasses(
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive
            )}
            onClick={() => setFilter('all')}
          >
            All <span className={styles.filterCount}>{counts.all}</span>
          </button>
          <button
            className={mergeClasses(
              styles.filterButton,
              filter === 'found' && styles.filterButtonActive
            )}
            onClick={() => setFilter('found')}
          >
            <CheckmarkCircle24Filled className={styles.statusFound} style={{ width: 16, height: 16 }} />
            Found <span className={styles.filterCount}>{counts.found}</span>
          </button>
          <button
            className={mergeClasses(
              styles.filterButton,
              filter === 'not-found' && styles.filterButtonActive
            )}
            onClick={() => setFilter('not-found')}
          >
            <DismissCircle24Filled className={styles.statusNotFound} style={{ width: 16, height: 16 }} />
            Not Found <span className={styles.filterCount}>{counts['not-found']}</span>
          </button>
          <button
            className={mergeClasses(
              styles.filterButton,
              filter === 'duplicate' && styles.filterButtonActive
            )}
            onClick={() => setFilter('duplicate')}
          >
            <Copy24Regular className={styles.statusDuplicate} style={{ width: 16, height: 16 }} />
            Duplicate <span className={styles.filterCount}>{counts.duplicate}</span>
          </button>
          <button
            className={mergeClasses(
              styles.filterButton,
              filter === 'invalid' && styles.filterButtonActive
            )}
            onClick={() => setFilter('invalid')}
          >
            <Warning24Filled className={styles.statusInvalid} style={{ width: 16, height: 16 }} />
            Invalid <span className={styles.filterCount}>{counts.invalid}</span>
          </button>
        </div>
      )}

      {/* Results list */}
      {!isProcessing && filteredResults.length > 0 && (
        <Card>
          <div className={styles.resultsList}>
            {filteredResults.map((result, idx) => {
              const replacement = getReplacementModel(result);

              return (
                <div key={idx} className={styles.resultRow}>
                  {getStatusIcon(result.status, styles)}
                  <Text className={styles.rowNumber}>#{result.row}</Text>
                  <Text className={styles.inputModel}>{result.input}</Text>
                  {replacement && (
                    <Text className={styles.replacement}>{'\u2192'} {replacement}</Text>
                  )}
                  <Text className={styles.quantity}>x{result.quantity}</Text>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!isProcessing && filteredResults.length === 0 && filter !== 'all' && (
        <div className={styles.emptyState}>
          <Text>No items match the selected filter.</Text>
        </div>
      )}
    </div>
  );
}
