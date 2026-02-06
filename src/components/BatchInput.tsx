/**
 * BatchInput Component
 *
 * Multi-line textarea for entering multiple camera models at once.
 * Shows model count and provides batch search trigger.
 */

import {
  Textarea,
  Button,
  Text,
  ProgressBar,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Search24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import type { BatchProgress } from '@/types';
import { axisTokens } from '@/styles/fluentTheme';

// =============================================================================
// STYLES
// =============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  textareaWrapper: {
    position: 'relative',
  },
  textarea: {
    width: '100%',
    minHeight: '150px',
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeBase300,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
  },
  modelCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  countBadge: {
    backgroundColor: axisTokens.primary,
    color: '#000',
    padding: '0.25rem 0.5rem',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  hint: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

// =============================================================================
// TYPES
// =============================================================================

export interface BatchInputProps {
  /** Current raw input value */
  value: string;

  /** Callback when input changes */
  onChange: (value: string) => void;

  /** Callback when search is triggered */
  onSearch: () => void;

  /** Callback to clear input */
  onClear: () => void;

  /** Number of models parsed from input */
  modelCount: number;

  /** Whether batch search is in progress */
  isProcessing: boolean;

  /** Current progress */
  progress: BatchProgress;

  /** Placeholder text */
  placeholder?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BatchInput({
  value,
  onChange,
  onSearch,
  onClear,
  modelCount,
  isProcessing,
  progress,
  placeholder = 'Enter camera models, one per line...\n\nExample:\nDS-2CD2143G2-I\nHNM-4221R\nIPC-HFW2831E-S',
}: BatchInputProps) {
  const styles = useStyles();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to search
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Text className={styles.title}>Batch Search</Text>
        <div className={styles.modelCount}>
          <Text size={200}>Models detected:</Text>
          <span className={styles.countBadge}>{modelCount}</span>
        </div>
      </div>

      {/* Textarea */}
      <div className={styles.textareaWrapper}>
        <Textarea
          value={value}
          onChange={(_e, data) => onChange(data.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.textarea}
          disabled={isProcessing}
          resize="vertical"
          aria-label="Enter camera models for batch search"
        />
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className={styles.progressContainer}>
          <ProgressBar value={progress.percent / 100} />
          <div className={styles.progressText}>
            <span>Processing...</span>
            <span>
              {progress.current} / {progress.total} ({progress.percent}%)
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <Button
          appearance="primary"
          icon={<Search24Regular />}
          onClick={onSearch}
          disabled={modelCount === 0 || isProcessing}
        >
          Search All ({modelCount})
        </Button>
        <Button
          appearance="outline"
          icon={<Dismiss24Regular />}
          onClick={onClear}
          disabled={value.length === 0 || isProcessing}
        >
          Clear
        </Button>
      </div>

      {/* Hint */}
      <Text className={styles.hint}>
        Tip: Press Ctrl+Enter to start search. One model per line.
      </Text>
    </div>
  );
}
