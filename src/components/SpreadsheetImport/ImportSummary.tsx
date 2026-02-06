/**
 * ImportSummary Component
 *
 * Shows final import summary with counts and action buttons.
 */

import {
  Card,
  Text,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Copy24Regular,
  Warning24Filled,
  ArrowLeft24Regular,
  Add24Regular,
  ArrowReset24Regular,
} from '@fluentui/react-icons';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  summaryCard: {
    padding: '1.5rem',
  },
  summaryTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase500,
    marginBottom: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  statIcon: {
    width: '32px',
    height: '32px',
    marginBottom: '0.5rem',
  },
  statIconFound: {
    color: axisTokens.success,
  },
  statIconNotFound: {
    color: tokens.colorNeutralForeground3,
  },
  statIconDuplicate: {
    color: axisTokens.cloud,
  },
  statIconInvalid: {
    color: axisTokens.error,
  },
  statValue: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: `${axisTokens.success}15`,
    borderRadius: tokens.borderRadiusMedium,
    color: axisTokens.success,
  },
  warningMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: `${axisTokens.cloud}15`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground1,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  leftActions: {
    display: 'flex',
    gap: '0.5rem',
  },
});

// =============================================================================
// TYPES
// =============================================================================

export interface ImportSummaryProps {
  /** Summary statistics */
  summary: {
    readonly totalRows: number;
    readonly validatedRows: number;
    readonly foundCount: number;
    readonly notFoundCount: number;
    readonly duplicateCount: number;
    readonly invalidCount: number;
  };
  /** Callback when user wants to add found items to batch */
  onAddToBatch: () => void;
  /** Callback when user wants to go back */
  onBack: () => void;
  /** Callback when user wants to start over */
  onReset: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ImportSummary({
  summary,
  onAddToBatch,
  onBack,
  onReset,
}: ImportSummaryProps) {
  const styles = useStyles();

  const hasFoundItems = summary.foundCount > 0;

  return (
    <div className={styles.container}>
      {/* Summary Card */}
      <Card className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>Import Summary</Text>

        <div className={styles.statsGrid}>
          {/* Found */}
          <div className={styles.statItem}>
            <CheckmarkCircle24Filled className={`${styles.statIcon} ${styles.statIconFound}`} />
            <Text className={styles.statValue}>{summary.foundCount}</Text>
            <Text className={styles.statLabel}>Found</Text>
          </div>

          {/* Not Found */}
          <div className={styles.statItem}>
            <DismissCircle24Filled className={`${styles.statIcon} ${styles.statIconNotFound}`} />
            <Text className={styles.statValue}>{summary.notFoundCount}</Text>
            <Text className={styles.statLabel}>Not Found</Text>
          </div>

          {/* Duplicates */}
          <div className={styles.statItem}>
            <Copy24Regular className={`${styles.statIcon} ${styles.statIconDuplicate}`} />
            <Text className={styles.statValue}>{summary.duplicateCount}</Text>
            <Text className={styles.statLabel}>Duplicates</Text>
          </div>

          {/* Invalid */}
          <div className={styles.statItem}>
            <Warning24Filled className={`${styles.statIcon} ${styles.statIconInvalid}`} />
            <Text className={styles.statValue}>{summary.invalidCount}</Text>
            <Text className={styles.statLabel}>Invalid</Text>
          </div>
        </div>
      </Card>

      {/* Success/Warning Message */}
      {hasFoundItems ? (
        <div className={styles.successMessage}>
          <CheckmarkCircle24Filled style={{ width: 24, height: 24 }} />
          <Text>
            {summary.foundCount} models are ready to add to your batch search.
            {summary.notFoundCount > 0 &&
              ` (${summary.notFoundCount} models were not found in the database)`}
          </Text>
        </div>
      ) : (
        <div className={styles.warningMessage}>
          <Warning24Filled style={{ width: 24, height: 24, color: axisTokens.cloud }} />
          <Text>
            No matching models were found. Please check your spreadsheet and column mapping.
          </Text>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <div className={styles.leftActions}>
          <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={onBack}>
            Back to Mapping
          </Button>
          <Button appearance="subtle" icon={<ArrowReset24Regular />} onClick={onReset}>
            Start Over
          </Button>
        </div>

        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={onAddToBatch}
          disabled={!hasFoundItems}
        >
          Add {summary.foundCount} Models to Batch
        </Button>
      </div>
    </div>
  );
}
