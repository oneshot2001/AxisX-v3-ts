/**
 * FileUploader Component
 *
 * Drag-and-drop file upload with click-to-browse support.
 * Accepts CSV, XLSX, and XLS files.
 */

import { useCallback, useState, useRef } from 'react';
import {
  Text,
  Button,
  makeStyles,
  tokens,
  mergeClasses,
} from '@fluentui/react-components';
import { ArrowUpload24Regular } from '@fluentui/react-icons';
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
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      border: `2px dashed ${axisTokens.primary}`,
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  dropzoneActive: {
    backgroundColor: tokens.colorNeutralBackground3,
    border: `2px solid ${axisTokens.primary}`,
  },
  icon: {
    width: '48px',
    height: '48px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '1rem',
  },
  iconActive: {
    // Color applied via inline style to avoid Griffel limitations
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginBottom: '1rem',
  },
  formats: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  formatBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground4,
    fontSize: tokens.fontSizeBase100,
    fontFamily: 'monospace',
  },
  hiddenInput: {
    display: 'none',
  },
  error: {
    padding: '0.75rem 1rem',
    backgroundColor: `${axisTokens.error}15`,
    borderRadius: tokens.borderRadiusMedium,
    color: axisTokens.error,
    fontSize: tokens.fontSizeBase200,
  },
});

// =============================================================================
// TYPES
// =============================================================================

export interface FileUploaderProps {
  /** Callback when file is selected */
  onFileSelect: (file: File) => void;
  /** Whether upload is in progress */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FileUploader({ onFileSelect, isLoading, error }: FileUploaderProps) {
  const styles = useStyles();
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0]) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0]) {
        onFileSelect(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [onFileSelect]
  );

  return (
    <div className={styles.container}>
      {/* Dropzone */}
      <div
        className={mergeClasses(styles.dropzone, isDragActive && styles.dropzoneActive)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label="Upload spreadsheet file"
      >
        <ArrowUpload24Regular
          className={styles.icon}
          style={isDragActive ? { color: axisTokens.primary } : undefined}
        />
        <Text className={styles.title}>
          {isDragActive ? 'Drop file here' : 'Drag & drop a spreadsheet'}
        </Text>
        <Text className={styles.subtitle}>or click to browse</Text>
        <Button appearance="primary" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Select File'}
        </Button>
        <div className={styles.formats}>
          <span className={styles.formatBadge}>.csv</span>
          <span className={styles.formatBadge}>.xlsx</span>
          <span className={styles.formatBadge}>.xls</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className={styles.hiddenInput}
        aria-hidden="true"
      />

      {/* Error message */}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
